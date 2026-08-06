// ============================================================
//  ADBUILDER — ÉDITEUR  ->  /adbuilder/editor?template=<id>
//  Client Component : Konva pour dessiner le visuel (photo + texte +
//  fond), export PNG 1080x1920, sauvegarde locale (localStorage).
//  MVP : mise en page fixe par modèle, pas de glisser-déposer libre.
// ============================================================

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type Konva from "konva";
import {
  TEMPLATES,
  getTemplate,
  listerProjets,
  sauvegarderProjet,
  type CouleurFond,
  type Projet,
} from "../../lib/adbuilderStore";
import {
  LARGEUR_EXPORT,
  HAUTEUR_EXPORT,
  exporterStagePNG,
  chargerImageDepuisFichier,
  chargerImageDepuisDataUrl,
} from "../../lib/canvasUtils";

// Konva a besoin du DOM (canvas) : impossible à rendre côté serveur. Le
// canvas entier est isolé dans KonvaCanvas.tsx et chargé en un seul bloc —
// charger Stage/Layer/Rect/Text/Image séparément casse le rendu de Konva.
const KonvaCanvas = dynamic(() => import("./KonvaCanvas"), { ssr: false });

const PREVIEW_LARGEUR = 340;
const PREVIEW_HAUTEUR = Math.round((PREVIEW_LARGEUR * HAUTEUR_EXPORT) / LARGEUR_EXPORT);
const ECHELLE = PREVIEW_LARGEUR / LARGEUR_EXPORT; // convertit une mesure "pleine résolution" en pixels d'aperçu

const FONDS: Record<CouleurFond, string> = {
  white: "#FBEEDA",
  dore: "#C9A84C",
  bleu: "#14213D",
  orange: "#F1720A",
};
const TEXTE_SUR_FOND: Record<CouleurFond, string> = {
  white: "#14213D",
  dore: "#FFFBF3",
  bleu: "#FBEEDA",
  orange: "#FFFBF3",
};

// Ajuste une image dans une boîte (contain, centrée) — jamais rognée, peut
// laisser un espace vide autour si le format ne correspond pas à la boîte.
function ajusterDansBoite(img: HTMLImageElement, boiteW: number, boiteH: number) {
  const ratioImg = img.width / img.height;
  const ratioBoite = boiteW / boiteH;
  if (ratioImg > ratioBoite) {
    return { largeur: boiteW, hauteur: boiteW / ratioImg };
  }
  return { largeur: boiteH * ratioImg, hauteur: boiteH };
}

// Couvre entièrement la boîte (comme "background-size: cover") — utilisé
// pour la position "arrière-plan", quitte à déborder hors cadre (recadré
// par le canvas, qui n'affiche que ce qui est dans la boîte).
function ajusterEnCouverture(img: HTMLImageElement, boiteW: number, boiteH: number) {
  const echelle = Math.max(boiteW / img.width, boiteH / img.height);
  return { largeur: img.width * echelle, hauteur: img.height * echelle };
}

function EditeurContenu() {
  const searchParams = useSearchParams();
  const stageRef = useRef<Konva.Stage | null>(null);

  // Reprise d'un projet enregistré (?projet=<id>) ou nouveau modèle (?template=<id>).
  const projetExistant = (() => {
    const idProjet = searchParams.get("projet");
    return idProjet ? listerProjets().find((p) => p.id === idProjet) ?? null : null;
  })();
  const templateInitial = getTemplate(
    projetExistant?.templateId ?? searchParams.get("template") ?? TEMPLATES[0].id
  );

  const [templateId, setTemplateId] = useState(templateInitial.id);
  const [titre, setTitre] = useState(projetExistant?.titre ?? templateInitial.titreDefaut);
  const [description, setDescription] = useState(projetExistant?.description ?? templateInitial.texteDefaut);
  const [fond, setFond] = useState<CouleurFond>(projetExistant?.fond ?? templateInitial.fondParDefaut);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [positionImage, setPositionImage] = useState<"haut" | "fond">(
    templateInitial.layout === "overlay" ? "fond" : "haut"
  );
  const [echelleImage, setEchelleImage] = useState(1);
  const [projetId] = useState(() => projetExistant?.id ?? crypto.randomUUID());
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const template = getTemplate(templateId);
  const couleurTexte = TEXTE_SUR_FOND[fond];

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

  function handleDownload() {
    const stage = stageRef.current;
    if (!stage) return;
    exporterStagePNG(stage, `limak-pub-${template.id}`);
  }

  function handleSave() {
    const projet: Projet = {
      id: projetId,
      templateId,
      titre,
      description,
      fond,
      imageDataUrl: image?.src ?? null,
      creeLe: Date.now(),
    };
    sauvegarderProjet(projet);
    setMessage("Projet enregistré !");
  }

  // --- Calcul des zones selon le modèle (coordonnées "pleine résolution") ---
  const marge = 60;
  let boiteImageModele: { x: number; y: number; w: number; h: number } | null = null;
  let boiteTitre = { x: marge, y: 0, w: LARGEUR_EXPORT - marge * 2 };
  let boiteDesc = { x: marge, y: 0, w: LARGEUR_EXPORT - marge * 2 };
  let alignTexte: "left" | "center" = "center";

  switch (template.layout) {
    case "vertical":
      boiteImageModele = { x: marge, y: marge, w: LARGEUR_EXPORT - marge * 2, h: 1100 };
      boiteTitre = { ...boiteTitre, y: 1220 };
      boiteDesc = { ...boiteDesc, y: 1340 };
      break;
    case "overlay":
      boiteImageModele = { x: 0, y: 0, w: LARGEUR_EXPORT, h: HAUTEUR_EXPORT };
      boiteTitre = { ...boiteTitre, y: HAUTEUR_EXPORT - 320 };
      boiteDesc = { ...boiteDesc, y: HAUTEUR_EXPORT - 210 };
      break;
    case "split":
      boiteImageModele = { x: 0, y: 0, w: LARGEUR_EXPORT / 2, h: HAUTEUR_EXPORT };
      boiteTitre = { x: LARGEUR_EXPORT / 2 + 50, y: 780, w: LARGEUR_EXPORT / 2 - 90 };
      boiteDesc = { x: LARGEUR_EXPORT / 2 + 50, y: 920, w: LARGEUR_EXPORT / 2 - 90 };
      alignTexte = "left";
      break;
    case "texte-seul":
      boiteTitre = { ...boiteTitre, y: 820 };
      boiteDesc = { ...boiteDesc, y: 980 };
      break;
    case "badge-centre":
      boiteImageModele = { x: LARGEUR_EXPORT / 2 - 320, y: 260, w: 640, h: 640 };
      boiteTitre = { ...boiteTitre, y: 1000 };
      boiteDesc = { ...boiteDesc, y: 1120 };
      break;
  }

  // "Haut" respecte la zone du modèle (ou un bandeau haut par défaut pour les
  // modèles texte-seul) — "Arrière-plan" force la photo en plein cadre, quel
  // que soit le modèle choisi.
  const boiteImageHaut = boiteImageModele ?? { x: marge, y: marge, w: LARGEUR_EXPORT - marge * 2, h: 1100 };
  const boiteImageFond = { x: 0, y: 0, w: LARGEUR_EXPORT, h: HAUTEUR_EXPORT };
  const boiteImage = positionImage === "fond" ? boiteImageFond : boiteImageHaut;
  const banniereOverlay = positionImage === "fond";

  const imageAjusteeBase = image
    ? positionImage === "fond"
      ? ajusterEnCouverture(image, boiteImage.w, boiteImage.h)
      : ajusterDansBoite(image, boiteImage.w, boiteImage.h)
    : null;
  const imageAjustee = imageAjusteeBase
    ? { largeur: imageAjusteeBase.largeur * echelleImage, hauteur: imageAjusteeBase.hauteur * echelleImage }
    : null;

  return (
    <main className="mx-auto max-w-5xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <div className="mb-4 flex items-center gap-4">
        <Link
          href="/adbuilder"
          className="text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
        >
          ← Retour aux modèles
        </Link>
        <Link
          href="/adbuilder/projets"
          className="text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
        >
          Mes projets
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* --- APERÇU --- */}
        <div>
          <div
            className="overflow-hidden rounded-xl border border-[#14213D]/15 shadow-sm"
            style={{ width: PREVIEW_LARGEUR, height: PREVIEW_HAUTEUR }}
          >
            <KonvaCanvas
              ref={stageRef}
              largeurAffichage={PREVIEW_LARGEUR}
              hauteurAffichage={PREVIEW_HAUTEUR}
              echelleAffichage={ECHELLE}
              fond={FONDS[fond]}
              couleurTexte={couleurTexte}
              image={image}
              boiteImage={boiteImage}
              imageAjustee={imageAjustee}
              banniereOverlay={banniereOverlay}
              titre={titre}
              boiteTitre={boiteTitre}
              description={description}
              boiteDesc={boiteDesc}
              alignTexte={alignTexte}
            />
          </div>
          <p className="mt-2 text-center text-xs text-neutral-400 dark:text-gray-500">
            Aperçu — export réel en 1080×1920
          </p>
        </div>

        {/* --- PANNEAU DE RÉGLAGES --- */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#14213D] dark:text-gray-300">Modèle</label>
            <select
              value={templateId}
              onChange={(e) => {
                const t = getTemplate(e.target.value);
                setTemplateId(t.id);
                setFond(t.fondParDefaut);
                setTitre(t.titreDefaut);
                setDescription(t.texteDefaut);
                setPositionImage(t.layout === "overlay" ? "fond" : "haut");
                setEchelleImage(1);
              }}
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#14213D] dark:text-gray-300">
              Photo produit
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="block flex-1 text-sm text-neutral-600 dark:text-gray-400"
              />
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
                  <p className="mb-1.5 text-xs font-medium text-neutral-500 dark:text-gray-400">
                    Position de la photo
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPositionImage("haut")}
                      className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        positionImage === "haut"
                          ? "bg-[#14213D] text-white"
                          : "border border-[#14213D]/20 text-[#14213D] dark:text-gray-300"
                      }`}
                    >
                      En haut
                    </button>
                    <button
                      type="button"
                      onClick={() => setPositionImage("fond")}
                      className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        positionImage === "fond"
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

          <div>
            <label className="block text-sm font-medium text-[#14213D] dark:text-gray-300">Titre</label>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#14213D] dark:text-gray-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#14213D] dark:text-gray-300">
              Couleur de fond
            </label>
            <div className="mt-2 flex gap-3">
              {(Object.keys(FONDS) as CouleurFond[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFond(c)}
                  aria-label={c}
                  className={`h-9 w-9 rounded-full border-2 transition ${
                    fond === c ? "border-[#F1720A] scale-110" : "border-[#14213D]/20"
                  }`}
                  style={{ backgroundColor: FONDS[c] }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-full bg-[#F1720A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C95900]"
            >
              Télécharger le PNG
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
    <Suspense fallback={null}>
      <EditeurContenu />
    </Suspense>
  );
}
