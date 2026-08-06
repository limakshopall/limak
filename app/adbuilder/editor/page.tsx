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

// Konva a besoin du DOM (canvas) : impossible à rendre côté serveur.
const Stage = dynamic(() => import("react-konva").then((m) => m.Stage), { ssr: false });
const Layer = dynamic(() => import("react-konva").then((m) => m.Layer), { ssr: false });
const KRect = dynamic(() => import("react-konva").then((m) => m.Rect), { ssr: false });
const KText = dynamic(() => import("react-konva").then((m) => m.Text), { ssr: false });
const KImage = dynamic(() => import("react-konva").then((m) => m.Image), { ssr: false });

const PREVIEW_LARGEUR = 340;
const PREVIEW_HAUTEUR = Math.round((PREVIEW_LARGEUR * HAUTEUR_EXPORT) / LARGEUR_EXPORT);
const ECHELLE = PREVIEW_LARGEUR / LARGEUR_EXPORT;
const px = (n: number) => n * ECHELLE; // convertit une mesure "pleine résolution" en pixels d'aperçu

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

// Ajuste une image dans une boîte (contain, centrée) — pas de recadrage.
function ajusterDansBoite(img: HTMLImageElement, boiteW: number, boiteH: number) {
  const ratioImg = img.width / img.height;
  const ratioBoite = boiteW / boiteH;
  let largeur: number;
  let hauteur: number;
  if (ratioImg > ratioBoite) {
    largeur = boiteW;
    hauteur = boiteW / ratioImg;
  } else {
    hauteur = boiteH;
    largeur = boiteH * ratioImg;
  }
  return { largeur, hauteur };
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
  const [projetId] = useState(() => projetExistant?.id ?? crypto.randomUUID());
  const [message, setMessage] = useState("");

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
  let boiteImage: { x: number; y: number; w: number; h: number } | null = null;
  let boiteTitre = { x: marge, y: 0, w: LARGEUR_EXPORT - marge * 2 };
  let boiteDesc = { x: marge, y: 0, w: LARGEUR_EXPORT - marge * 2 };
  let alignTexte: "left" | "center" = "center";
  let banniereOverlay = false;

  switch (template.layout) {
    case "vertical":
      boiteImage = { x: marge, y: marge, w: LARGEUR_EXPORT - marge * 2, h: 1100 };
      boiteTitre = { ...boiteTitre, y: 1220 };
      boiteDesc = { ...boiteDesc, y: 1340 };
      break;
    case "overlay":
      boiteImage = { x: 0, y: 0, w: LARGEUR_EXPORT, h: HAUTEUR_EXPORT };
      boiteTitre = { ...boiteTitre, y: HAUTEUR_EXPORT - 320 };
      boiteDesc = { ...boiteDesc, y: HAUTEUR_EXPORT - 210 };
      banniereOverlay = true;
      break;
    case "split":
      boiteImage = { x: 0, y: 0, w: LARGEUR_EXPORT / 2, h: HAUTEUR_EXPORT };
      boiteTitre = { x: LARGEUR_EXPORT / 2 + 50, y: 780, w: LARGEUR_EXPORT / 2 - 90 };
      boiteDesc = { x: LARGEUR_EXPORT / 2 + 50, y: 920, w: LARGEUR_EXPORT / 2 - 90 };
      alignTexte = "left";
      break;
    case "texte-seul":
      boiteTitre = { ...boiteTitre, y: 820 };
      boiteDesc = { ...boiteDesc, y: 980 };
      break;
    case "badge-centre":
      boiteImage = { x: LARGEUR_EXPORT / 2 - 320, y: 260, w: 640, h: 640 };
      boiteTitre = { ...boiteTitre, y: 1000 };
      boiteDesc = { ...boiteDesc, y: 1120 };
      break;
  }

  const imageAjustee =
    image && boiteImage ? ajusterDansBoite(image, boiteImage.w, boiteImage.h) : null;

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
            <Stage ref={stageRef} width={PREVIEW_LARGEUR} height={PREVIEW_HAUTEUR}>
              <Layer>
                <KRect x={0} y={0} width={LARGEUR_EXPORT} height={HAUTEUR_EXPORT} fill={FONDS[fond]} scaleX={ECHELLE} scaleY={ECHELLE} />

                {boiteImage && imageAjustee && image && (
                  <KImage
                    image={image}
                    x={px(boiteImage.x + (boiteImage.w - imageAjustee.largeur) / 2)}
                    y={px(boiteImage.y + (boiteImage.h - imageAjustee.hauteur) / 2)}
                    width={px(imageAjustee.largeur)}
                    height={px(imageAjustee.hauteur)}
                  />
                )}

                {boiteImage && !image && (
                  <KRect
                    x={px(boiteImage.x)}
                    y={px(boiteImage.y)}
                    width={px(boiteImage.w)}
                    height={px(boiteImage.h)}
                    fill={fond === "white" ? "#FBEEDA" : "rgba(255,255,255,0.12)"}
                    dash={[8, 6]}
                    stroke={couleurTexte}
                    strokeWidth={1}
                  />
                )}

                {banniereOverlay && (
                  <KRect
                    x={0}
                    y={px(HAUTEUR_EXPORT - 380)}
                    width={LARGEUR_EXPORT * ECHELLE}
                    height={px(380)}
                    fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                    fillLinearGradientEndPoint={{ x: 0, y: px(380) }}
                    fillLinearGradientColorStops={[0, "rgba(20,33,61,0)", 1, "rgba(20,33,61,0.85)"]}
                  />
                )}

                <KText
                  text={titre}
                  x={px(boiteTitre.x)}
                  y={px(boiteTitre.y)}
                  width={px(boiteTitre.w)}
                  align={alignTexte}
                  fontSize={px(64)}
                  fontStyle="bold"
                  fill={banniereOverlay ? "#FFFBF3" : couleurTexte}
                  wrap="word"
                />
                <KText
                  text={description}
                  x={px(boiteDesc.x)}
                  y={px(boiteDesc.y)}
                  width={px(boiteDesc.w)}
                  align={alignTexte}
                  fontSize={px(36)}
                  fill={banniereOverlay ? "#FBEEDA" : couleurTexte}
                  opacity={0.9}
                  wrap="word"
                />
              </Layer>
            </Stage>
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
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="mt-1 block w-full text-sm text-neutral-600 dark:text-gray-400"
            />
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
