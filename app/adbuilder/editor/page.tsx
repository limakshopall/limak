// ============================================================
//  ADBUILDER — ÉDITEUR  ->  /adbuilder/editor?template=<id>
//  Client Component : Konva pour dessiner le visuel (photo + texte +
//  CTA + fond), export PNG multi-format, sauvegarde locale, annuler/
//  refaire. MVP : mise en page proportionnelle par modèle, pas de
//  glisser-déposer libre du texte/de la photo.
// ============================================================

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type Konva from "konva";
import {
  TEMPLATES,
  FORMATS,
  PALETTE_LIMAK,
  getTemplate,
  getFormat,
  listerProjets,
  sauvegarderProjet,
  type Police,
  type TailleTexte,
  type Projet,
} from "../../lib/adbuilderStore";
import {
  exporterStagePNG,
  chargerImageDepuisFichier,
  chargerImageDepuisDataUrl,
} from "../../lib/canvasUtils";
import { useHistorique } from "../../lib/useHistorique";

// Konva a besoin du DOM (canvas) : impossible à rendre côté serveur. Le
// canvas entier est isolé dans KonvaCanvas.tsx et chargé en un seul bloc —
// charger Stage/Layer/Rect/Text/Image séparément casse le rendu de Konva.
const KonvaCanvas = dynamic(() => import("./KonvaCanvas"), { ssr: false });

const PREVIEW_MAX_LARGEUR = 340;
const PREVIEW_MAX_HAUTEUR = 520;

const POLICES: Police[] = ["Arial", "Playfair Display", "Montserrat"];
const MULTIPLICATEUR_TAILLE: Record<TailleTexte, number> = { petit: 0.75, moyen: 1, grand: 1.3 };

type DocEtat = {
  templateId: string;
  formatId: string;
  titre: string;
  description: string;
  cta: string;
  fond: string;
  couleurTexte: string;
  couleurCTA: string;
  police: Police;
  tailleTexte: TailleTexte;
  positionImage: "haut" | "fond";
};

// Contraste simple (noir/blanc) selon la luminosité de la couleur de fond.
function couleurContrastee(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const luminosite = (r * 299 + g * 587 + b * 114) / 1000;
  return luminosite > 150 ? "#14213D" : "#FFFBF3";
}

// Ajuste une image dans une boîte (contain, centrée) — jamais rognée.
function ajusterDansBoite(img: HTMLImageElement, boiteW: number, boiteH: number) {
  const ratioImg = img.width / img.height;
  const ratioBoite = boiteW / boiteH;
  if (ratioImg > ratioBoite) {
    return { largeur: boiteW, hauteur: boiteW / ratioImg };
  }
  return { largeur: boiteH * ratioImg, hauteur: boiteH };
}

// Couvre entièrement la boîte ("background-size: cover") — pour la
// position "arrière-plan", quitte à déborder (rogné par le canvas).
function ajusterEnCouverture(img: HTMLImageElement, boiteW: number, boiteH: number) {
  const echelle = Math.max(boiteW / img.width, boiteH / img.height);
  return { largeur: img.width * echelle, hauteur: img.height * echelle };
}

function EditeurContenu() {
  const searchParams = useSearchParams();
  const stageRef = useRef<Konva.Stage | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const projetExistant = (() => {
    const idProjet = searchParams.get("projet");
    return idProjet ? listerProjets().find((p) => p.id === idProjet) ?? null : null;
  })();
  const templateInitial = getTemplate(
    projetExistant?.templateId ?? searchParams.get("template") ?? TEMPLATES[0].id
  );

  const docInitial: DocEtat = {
    templateId: templateInitial.id,
    formatId: projetExistant?.formatId ?? "ig-story",
    titre: projetExistant?.titre ?? templateInitial.titreDefaut,
    description: projetExistant?.description ?? templateInitial.texteDefaut,
    cta: projetExistant?.cta ?? templateInitial.ctaDefaut,
    fond: projetExistant?.fond ?? templateInitial.fondParDefaut,
    couleurTexte: projetExistant?.couleurTexte ?? couleurContrastee(templateInitial.fondParDefaut),
    couleurCTA: projetExistant?.couleurCTA ?? PALETTE_LIMAK.orange,
    police: projetExistant?.police ?? "Arial",
    tailleTexte: projetExistant?.tailleTexte ?? "moyen",
    positionImage: templateInitial.layout === "overlay" ? "fond" : "haut",
  };

  const { etat: doc, setEtat: setDoc, setEtatLive, annuler, refaire, peutAnnuler, peutRefaire } =
    useHistorique<DocEtat>(docInitial);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [echelleImage, setEchelleImage] = useState(1);
  const [projetId] = useState(() => projetExistant?.id ?? crypto.randomUUID());
  const [message, setMessage] = useState("");
  const [policesChargees, setPolicesChargees] = useState(false);

  const template = getTemplate(doc.templateId);
  const format = getFormat(doc.formatId);

  // Charge les 2 polices Google Fonts (Arial est déjà native) et force un
  // nouveau rendu du canvas une fois prêtes (sinon Konva garde la police de
  // secours même après le chargement, le canvas ne se redessine pas tout seul).
  useEffect(() => {
    Promise.all([
      document.fonts.load('700 64px "Playfair Display"'),
      document.fonts.load('700 64px "Montserrat"'),
    ])
      .then(() => setPolicesChargees(true))
      .catch(() => {});
  }, []);

  // Recharge la photo du projet enregistré (chargement asynchrone).
  useEffect(() => {
    if (!projetExistant?.imageDataUrl) return;
    chargerImageDepuisDataUrl(projetExistant.imageDataUrl).then(setImage).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(t);
  }, [message]);

  // Raccourcis clavier : Ctrl+Z annule, Ctrl+Y (ou Ctrl+Shift+Z) refait.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const cible = e.target as HTMLElement;
      const dansChampTexte = cible.tagName === "INPUT" || cible.tagName === "TEXTAREA";
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "z" && !e.shiftKey) {
        if (dansChampTexte) return; // laisse le navigateur gérer l'annulation dans le champ
        e.preventDefault();
        annuler();
      } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        if (dansChampTexte) return;
        e.preventDefault();
        refaire();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [annuler, refaire]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    const img = await chargerImageDepuisFichier(fichier);
    setImage(img);
    setEchelleImage(1);
  }

  function handleSupprimerImage() {
    setImage(null);
    setEchelleImage(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleChangerTemplate(idTemplate: string) {
    const t = getTemplate(idTemplate);
    setDoc({
      ...doc,
      templateId: t.id,
      fond: t.fondParDefaut,
      couleurTexte: couleurContrastee(t.fondParDefaut),
      titre: t.titreDefaut,
      description: t.texteDefaut,
      cta: t.ctaDefaut,
      positionImage: t.layout === "overlay" ? "fond" : "haut",
    });
    setEchelleImage(1);
  }

  function handleDownload() {
    const stage = stageRef.current;
    if (!stage) return;
    exporterStagePNG(stage, `limak-pub-${format.id}`, format.w);
  }

  function handleSave() {
    const nom = window.prompt("Nom du projet :", "Ma pub " + template.nom);
    if (nom === null) return;
    const projet: Projet = {
      id: projetId,
      nom: nom.trim() || "Sans titre",
      templateId: doc.templateId,
      formatId: doc.formatId,
      titre: doc.titre,
      description: doc.description,
      cta: doc.cta,
      fond: doc.fond,
      couleurTexte: doc.couleurTexte,
      couleurCTA: doc.couleurCTA,
      police: doc.police,
      tailleTexte: doc.tailleTexte,
      imageDataUrl: image?.src ?? null,
      creeLe: Date.now(),
    };
    sauvegarderProjet(projet);
    setMessage("Projet enregistré !");
  }

  // --- Calcul des zones, en fractions du format choisi (s'adapte à tous
  // les formats : portrait, carré, paysage). ---
  const W = format.w;
  const H = format.h;
  const marge = W * 0.0556;

  let boiteImageModele: { x: number; y: number; w: number; h: number } | null = null;
  let boiteTitre = { x: marge, y: 0, w: W - marge * 2 };
  let boiteDesc = { x: marge, y: 0, w: W - marge * 2 };
  let boiteCTA = { x: 0, y: 0, w: W * 0.42, h: H * 0.07 };
  let alignTexte: "left" | "center" = "center";

  switch (template.layout) {
    case "vertical":
      boiteImageModele = { x: marge, y: marge, w: W - marge * 2, h: H * 0.573 };
      boiteTitre = { ...boiteTitre, y: H * 0.635 };
      boiteDesc = { ...boiteDesc, y: H * 0.698 };
      boiteCTA = { x: (W - boiteCTA.w) / 2, y: H * 0.76, w: boiteCTA.w, h: boiteCTA.h };
      break;
    case "overlay":
      boiteImageModele = { x: 0, y: 0, w: W, h: H };
      boiteTitre = { ...boiteTitre, y: H - H * 0.167 };
      boiteDesc = { ...boiteDesc, y: H - H * 0.109 };
      boiteCTA = { x: (W - boiteCTA.w) / 2, y: H - H * 0.045 - boiteCTA.h, w: boiteCTA.w, h: boiteCTA.h };
      break;
    case "split":
      boiteImageModele = { x: 0, y: 0, w: W / 2, h: H };
      boiteTitre = { x: W / 2 + marge, y: H * 0.406, w: W / 2 - marge * 1.5 };
      boiteDesc = { x: W / 2 + marge, y: H * 0.479, w: W / 2 - marge * 1.5 };
      boiteCTA = { x: W / 2 + marge, y: H * 0.56, w: W / 2 - marge * 1.5, h: boiteCTA.h };
      alignTexte = "left";
      break;
    case "texte-seul":
      boiteTitre = { ...boiteTitre, y: H * 0.427 };
      boiteDesc = { ...boiteDesc, y: H * 0.51 };
      boiteCTA = { x: (W - boiteCTA.w) / 2, y: H * 0.58, w: boiteCTA.w, h: boiteCTA.h };
      break;
    case "badge-centre": {
      const taille = Math.min(W, H) * 0.593;
      boiteImageModele = { x: (W - taille) / 2, y: H * 0.135, w: taille, h: taille };
      boiteTitre = { ...boiteTitre, y: H * 0.521 };
      boiteDesc = { ...boiteDesc, y: H * 0.583 };
      boiteCTA = { x: (W - boiteCTA.w) / 2, y: H * 0.65, w: boiteCTA.w, h: boiteCTA.h };
      break;
    }
  }

  const boiteImageHaut = boiteImageModele ?? { x: marge, y: marge, w: W - marge * 2, h: H * 0.573 };
  const boiteImageFond = { x: 0, y: 0, w: W, h: H };
  const boiteImage = doc.positionImage === "fond" ? boiteImageFond : boiteImageHaut;
  const banniereOverlay = doc.positionImage === "fond";

  const imageAjusteeBase = image
    ? doc.positionImage === "fond"
      ? ajusterEnCouverture(image, boiteImage.w, boiteImage.h)
      : ajusterDansBoite(image, boiteImage.w, boiteImage.h)
    : null;
  const imageAjustee = imageAjusteeBase
    ? { largeur: imageAjusteeBase.largeur * echelleImage, hauteur: imageAjusteeBase.hauteur * echelleImage }
    : null;

  const multiplicateur = MULTIPLICATEUR_TAILLE[doc.tailleTexte];
  const tailleTitre = H * 0.0333 * multiplicateur;
  const tailleDesc = H * 0.01875 * multiplicateur;

  // Aperçu : on garde le format proportionnel, limité à une taille raisonnable.
  const ratioFormat = W / H;
  let previewLargeur = PREVIEW_MAX_LARGEUR;
  let previewHauteur = previewLargeur / ratioFormat;
  if (previewHauteur > PREVIEW_MAX_HAUTEUR) {
    previewHauteur = PREVIEW_MAX_HAUTEUR;
    previewLargeur = previewHauteur * ratioFormat;
  }
  const echelleAffichage = previewLargeur / W;

  return (
    <main className="mx-auto max-w-6xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Link href="/adbuilder" className="text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400">
          ← Retour aux modèles
        </Link>
        <Link href="/adbuilder/projets" className="text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400">
          Mes projets
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={annuler}
            disabled={!peutAnnuler}
            title="Annuler (Ctrl+Z)"
            className="rounded-full border border-[#14213D]/20 px-3 py-1.5 text-xs font-semibold text-[#14213D] transition hover:bg-[#14213D]/5 disabled:opacity-30 dark:text-gray-300"
          >
            ↶ Annuler
          </button>
          <button
            type="button"
            onClick={refaire}
            disabled={!peutRefaire}
            title="Refaire (Ctrl+Y)"
            className="rounded-full border border-[#14213D]/20 px-3 py-1.5 text-xs font-semibold text-[#14213D] transition hover:bg-[#14213D]/5 disabled:opacity-30 dark:text-gray-300"
          >
            ↷ Refaire
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* --- APERÇU --- */}
        <div>
          <div
            className="mx-auto overflow-hidden rounded-xl border border-[#14213D]/15 shadow-sm"
            style={{ width: previewLargeur, height: previewHauteur }}
          >
            {/* La clé change quand les polices finissent de charger, pour forcer
                Konva à redessiner le texte avec la bonne police une fois prête. */}
            <KonvaCanvas
              key={policesChargees ? "polices-prêtes" : "polices-en-attente"}
              ref={stageRef}
              largeurExport={W}
              hauteurExport={H}
              largeurAffichage={previewLargeur}
              hauteurAffichage={previewHauteur}
              echelleAffichage={echelleAffichage}
              fond={doc.fond}
              couleurTexte={doc.couleurTexte}
              police={doc.police}
              image={image}
              boiteImage={boiteImage}
              imageAjustee={imageAjustee}
              banniereOverlay={banniereOverlay}
              titre={doc.titre}
              boiteTitre={boiteTitre}
              tailleTitre={tailleTitre}
              description={doc.description}
              boiteDesc={boiteDesc}
              tailleDesc={tailleDesc}
              alignTexte={alignTexte}
              cta={doc.cta}
              boiteCTA={boiteCTA}
              couleurCTA={doc.couleurCTA}
              couleurTexteCTA={couleurContrastee(doc.couleurCTA)}
            />
          </div>
          <p className="mt-2 text-center text-xs text-neutral-400 dark:text-gray-500">
            Aperçu — export réel en {format.w}×{format.h}
          </p>
        </div>

        {/* --- PANNEAU DE RÉGLAGES --- */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#14213D] dark:text-gray-300">Modèle</label>
              <select
                value={doc.templateId}
                onChange={(e) => handleChangerTemplate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] dark:text-gray-300">Format</label>
              <select
                value={doc.formatId}
                onChange={(e) => setDoc({ ...doc, formatId: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
              >
                {FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* --- PHOTO --- */}
          <div>
            <label className="block text-sm font-medium text-[#14213D] dark:text-gray-300">Photo produit</label>
            <div className="mt-1 flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-[#14213D]/20 px-4 py-1.5 text-sm font-semibold text-[#14213D] transition hover:bg-[#14213D]/5 dark:border-white/20 dark:text-gray-300"
              >
                {image ? "Changer la photo" : "Choisir une photo"}
              </button>
              {image && (
                <button
                  type="button"
                  onClick={handleSupprimerImage}
                  className="shrink-0 text-sm font-medium text-[#D6293E] hover:underline"
                >
                  Supprimer l&apos;image
                </button>
              )}
            </div>

            {image && (
              <div className="mt-3 space-y-3 rounded-lg border border-[#14213D]/10 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333]">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-neutral-500 dark:text-gray-400">Position de la photo</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDoc({ ...doc, positionImage: "haut" })}
                      className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        doc.positionImage === "haut"
                          ? "bg-[#14213D] text-white"
                          : "border border-[#14213D]/20 text-[#14213D] dark:text-gray-300"
                      }`}
                    >
                      En haut
                    </button>
                    <button
                      type="button"
                      onClick={() => setDoc({ ...doc, positionImage: "fond" })}
                      className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        doc.positionImage === "fond"
                          ? "bg-[#14213D] text-white"
                          : "border border-[#14213D]/20 text-[#14213D] dark:text-gray-300"
                      }`}
                    >
                      Arrière-plan
                    </button>
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-gray-400">
                    <span>Taille de la photo</span>
                    <span>{Math.round(echelleImage * 100)}%</span>
                  </p>
                  <input
                    type="range"
                    min={0.5}
                    max={1.8}
                    step={0.05}
                    value={echelleImage}
                    onChange={(e) => setEchelleImage(parseFloat(e.target.value))}
                    className="w-full accent-[#F1720A]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* --- TEXTE --- */}
          <div className="space-y-3 rounded-lg border border-[#14213D]/10 p-3 dark:border-white/15">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-gray-400">Texte</p>
            <div>
              <label className="block text-sm text-neutral-600 dark:text-gray-400">Titre</label>
              <input
                value={doc.titre}
                onChange={(e) => setEtatLive({ ...doc, titre: e.target.value })}
                onBlur={() => setDoc(doc)}
                className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600 dark:text-gray-400">Sous-titre / description</label>
              <textarea
                value={doc.description}
                onChange={(e) => setEtatLive({ ...doc, description: e.target.value })}
                onBlur={() => setDoc(doc)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600 dark:text-gray-400">
                Texte du bouton (CTA) <span className="text-neutral-400">— vide pour le masquer</span>
              </label>
              <input
                value={doc.cta}
                onChange={(e) => setEtatLive({ ...doc, cta: e.target.value })}
                onBlur={() => setDoc(doc)}
                className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
              />
            </div>
            <div>
              <p className="mb-1.5 text-sm text-neutral-600 dark:text-gray-400">Taille du texte</p>
              <div className="flex gap-2">
                {(["petit", "moyen", "grand"] as TailleTexte[]).map((taille) => (
                  <button
                    key={taille}
                    type="button"
                    onClick={() => setDoc({ ...doc, tailleTexte: taille })}
                    className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      doc.tailleTexte === taille
                        ? "bg-[#14213D] text-white"
                        : "border border-[#14213D]/20 text-[#14213D] dark:text-gray-300"
                    }`}
                  >
                    {taille}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* --- COULEURS --- */}
          <div className="space-y-3 rounded-lg border border-[#14213D]/10 p-3 dark:border-white/15">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-gray-400">Couleurs</p>

            {(
              [
                { cle: "fond" as const, label: "Fond" },
                { cle: "couleurTexte" as const, label: "Texte" },
                { cle: "couleurCTA" as const, label: "Bouton (CTA)" },
              ]
            ).map(({ cle, label }) => (
              <div key={cle}>
                <p className="mb-1.5 text-sm text-neutral-600 dark:text-gray-400">{label}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {Object.values(PALETTE_LIMAK).map((couleur) => (
                    <button
                      key={couleur}
                      type="button"
                      onClick={() => setDoc({ ...doc, [cle]: couleur })}
                      aria-label={couleur}
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        doc[cle] === couleur ? "border-[#F1720A] scale-110" : "border-[#14213D]/20"
                      }`}
                      style={{ backgroundColor: couleur }}
                    />
                  ))}
                  <input
                    type="color"
                    value={doc[cle]}
                    onChange={(e) => setDoc({ ...doc, [cle]: e.target.value })}
                    className="h-8 w-8 cursor-pointer rounded-full border border-[#14213D]/20 bg-transparent p-0"
                    title="Couleur personnalisée"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* --- POLICE --- */}
          <div>
            <label className="block text-sm font-medium text-[#14213D] dark:text-gray-300">Police</label>
            <select
              value={doc.police}
              onChange={(e) => setDoc({ ...doc, police: e.target.value as Police })}
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
              style={{ fontFamily: doc.police }}
            >
              {POLICES.map((p) => (
                <option key={p} value={p} style={{ fontFamily: p }}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* --- ACTIONS --- */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-full bg-[#F1720A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C95900]"
            >
              Télécharger ({format.nom})
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full border border-[#14213D]/20 px-5 py-2.5 text-sm font-semibold text-[#14213D] transition hover:bg-[#14213D]/5 dark:text-gray-300"
            >
              Enregistrer le projet
            </button>
            {message && <span className="text-sm font-medium text-[#1F7A5C]">{message}</span>}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EditeurAdBuilder() {
  return (
    <>
      {/* Polices Google Fonts pour le canvas (Arial est déjà native). Règle
          ESLint "no-page-custom-font" pensée pour l'ancien Pages Router —
          ne s'applique pas ici (App Router, page dédiée à l'outil interne). */}
      {/* eslint-disable @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Playfair+Display:wght@400;700&display=swap"
        rel="stylesheet"
      />
      {/* eslint-enable @next/next/no-page-custom-font */}
      <Suspense fallback={null}>
        <EditeurContenu />
      </Suspense>
    </>
  );
}
