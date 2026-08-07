// ============================================================
//  ADBUILDER — CANVAS KONVA (Client Component, chargé en un bloc)
//  Isolé dans son propre fichier : react-konva utilise un moteur de
//  rendu React personnalisé (comme react-three-fiber) qui casse si
//  on charge Stage/Layer/Rect/Text/Image séparément via next/dynamic.
//  Cette page l'importe en un seul bloc, avec ssr:false.
//
//  Chaque élément (photo, titre, description, CTA) est dans un Group
//  déplaçable/redimensionnable : clic pour sélectionner, glisser pour
//  déplacer, poignées (Transformer) pour redimensionner.
// ============================================================

"use client";

import { forwardRef, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Text, Image as KImage, Group, Transformer } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";

type Boite = { x: number; y: number; w: number; h: number };
export type SelectionId = "image" | "titre" | "desc" | "cta" | null;

export type ProprietesCanvas = {
  largeurExport: number;
  hauteurExport: number;
  largeurAffichage: number;
  hauteurAffichage: number;
  echelleAffichage: number;
  fond: string;
  couleurTexte: string;
  police: string;
  image: HTMLImageElement | null;
  boiteImage: Boite;
  imageAjustee: { largeur: number; hauteur: number } | null;
  banniereOverlay: boolean;
  titre: string;
  boiteTitre: { x: number; y: number; w: number };
  tailleTitre: number;
  description: string;
  boiteDesc: { x: number; y: number; w: number };
  tailleDesc: number;
  alignTexte: "left" | "center";
  cta: string;
  boiteCTA: { x: number; y: number; w: number; h: number };
  couleurCTA: string;
  couleurTexteCTA: string;
  // Sélection / édition libre
  selection: SelectionId;
  onSelect: (id: SelectionId) => void;
  onChangeBoite: (id: Exclude<SelectionId, null>, boite: { x: number; y: number; w: number; h?: number }) => void;
};

const KonvaCanvas = forwardRef<Konva.Stage, ProprietesCanvas>(function KonvaCanvas(
  {
    largeurExport,
    hauteurExport,
    largeurAffichage,
    hauteurAffichage,
    echelleAffichage,
    fond,
    couleurTexte,
    police,
    image,
    boiteImage,
    imageAjustee,
    banniereOverlay,
    titre,
    boiteTitre,
    tailleTitre,
    description,
    boiteDesc,
    tailleDesc,
    alignTexte,
    cta,
    boiteCTA,
    couleurCTA,
    couleurTexteCTA,
    selection,
    onSelect,
    onChangeBoite,
  },
  ref
) {
  const px = (n: number) => n * echelleAffichage;

  const groupImageRef = useRef<Konva.Group | null>(null);
  const groupTitreRef = useRef<Konva.Group | null>(null);
  const groupDescRef = useRef<Konva.Group | null>(null);
  const groupCtaRef = useRef<Konva.Group | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);

  const refs: Record<Exclude<SelectionId, null>, React.RefObject<Konva.Group | null>> = {
    image: groupImageRef,
    titre: groupTitreRef,
    desc: groupDescRef,
    cta: groupCtaRef,
  };

  // Attache la poignée de transformation (Transformer) au groupe sélectionné.
  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const node = selection ? refs[selection].current : null;
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  });

  function deselectionnerSiFond(e: KonvaEventObject<MouseEvent | TouchEvent>) {
    if (e.target === e.target.getStage()) onSelect(null);
  }

  // Fin de glissement : rapporte la nouvelle position (en pixels export).
  function creerOnDragEnd(id: Exclude<SelectionId, null>, boiteActuelle: { w: number; h?: number }) {
    return (e: KonvaEventObject<DragEvent>) => {
      const node = e.target;
      onChangeBoite(id, {
        x: node.x() / echelleAffichage,
        y: node.y() / echelleAffichage,
        w: boiteActuelle.w,
        h: boiteActuelle.h,
      });
    };
  }

  // Fin de redimensionnement : Konva change scaleX/scaleY, on les "cuit"
  // dans la largeur/hauteur logique puis on remet l'échelle à 1.
  function creerOnTransformEnd(id: Exclude<SelectionId, null>, boiteActuelle: { w: number; h?: number }) {
    return (e: KonvaEventObject<Event>) => {
      const node = e.target as Konva.Group;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChangeBoite(id, {
        x: node.x() / echelleAffichage,
        y: node.y() / echelleAffichage,
        w: Math.max(20, boiteActuelle.w * scaleX),
        h: boiteActuelle.h !== undefined ? Math.max(20, boiteActuelle.h * scaleY) : undefined,
      });
    };
  }

  return (
    <Stage
      ref={ref}
      width={largeurAffichage}
      height={hauteurAffichage}
      onMouseDown={deselectionnerSiFond}
      onTouchStart={deselectionnerSiFond}
    >
      <Layer ref={layerRef}>
        <Rect
          x={0}
          y={0}
          width={largeurExport}
          height={hauteurExport}
          fill={fond}
          scaleX={echelleAffichage}
          scaleY={echelleAffichage}
        />

        {/* --- PHOTO (déplaçable + redimensionnable) --- */}
        <Group
          ref={groupImageRef}
          x={px(boiteImage.x)}
          y={px(boiteImage.y)}
          draggable
          onClick={() => onSelect("image")}
          onTap={() => onSelect("image")}
          onDragStart={() => onSelect("image")}
          onDragEnd={creerOnDragEnd("image", { w: boiteImage.w, h: boiteImage.h })}
          onTransformEnd={creerOnTransformEnd("image", { w: boiteImage.w, h: boiteImage.h })}
        >
          {image && imageAjustee ? (
            <>
              <Rect width={px(boiteImage.w)} height={px(boiteImage.h)} fill="transparent" />
              <KImage
                image={image}
                x={px((boiteImage.w - imageAjustee.largeur) / 2)}
                y={px((boiteImage.h - imageAjustee.hauteur) / 2)}
                width={px(imageAjustee.largeur)}
                height={px(imageAjustee.hauteur)}
                listening={false}
              />
            </>
          ) : (
            <Rect
              width={px(boiteImage.w)}
              height={px(boiteImage.h)}
              fill={fond === "#FBEEDA" ? "#F1E4C8" : "rgba(255,255,255,0.12)"}
              dash={[8, 6]}
              stroke={couleurTexte}
              strokeWidth={1}
            />
          )}
        </Group>

        {banniereOverlay && (
          <Rect
            x={0}
            y={px(hauteurExport - hauteurExport * 0.2)}
            width={px(largeurExport)}
            height={px(hauteurExport * 0.2)}
            listening={false}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: px(hauteurExport * 0.2) }}
            fillLinearGradientColorStops={[0, "rgba(20,33,61,0)", 1, "rgba(20,33,61,0.85)"]}
          />
        )}

        {/* --- TITRE (déplaçable + largeur redimensionnable) --- */}
        <Group
          ref={groupTitreRef}
          x={px(boiteTitre.x)}
          y={px(boiteTitre.y)}
          draggable
          onClick={() => onSelect("titre")}
          onTap={() => onSelect("titre")}
          onDragStart={() => onSelect("titre")}
          onDragEnd={creerOnDragEnd("titre", { w: boiteTitre.w })}
          onTransformEnd={creerOnTransformEnd("titre", { w: boiteTitre.w })}
        >
          <Text
            text={titre}
            width={px(boiteTitre.w)}
            align={alignTexte}
            fontSize={px(tailleTitre)}
            fontFamily={police}
            fontStyle="bold"
            fill={banniereOverlay ? "#FFFBF3" : couleurTexte}
            wrap="word"
          />
        </Group>

        {/* --- DESCRIPTION (déplaçable + largeur redimensionnable) --- */}
        <Group
          ref={groupDescRef}
          x={px(boiteDesc.x)}
          y={px(boiteDesc.y)}
          draggable
          onClick={() => onSelect("desc")}
          onTap={() => onSelect("desc")}
          onDragStart={() => onSelect("desc")}
          onDragEnd={creerOnDragEnd("desc", { w: boiteDesc.w })}
          onTransformEnd={creerOnTransformEnd("desc", { w: boiteDesc.w })}
        >
          <Text
            text={description}
            width={px(boiteDesc.w)}
            align={alignTexte}
            fontSize={px(tailleDesc)}
            fontFamily={police}
            fill={banniereOverlay ? "#FBEEDA" : couleurTexte}
            opacity={0.9}
            wrap="word"
          />
        </Group>

        {/* --- CTA (déplaçable + redimensionnable) --- */}
        {cta.trim() && (
          <Group
            ref={groupCtaRef}
            x={px(boiteCTA.x)}
            y={px(boiteCTA.y)}
            draggable
            onClick={() => onSelect("cta")}
            onTap={() => onSelect("cta")}
            onDragStart={() => onSelect("cta")}
            onDragEnd={creerOnDragEnd("cta", { w: boiteCTA.w, h: boiteCTA.h })}
            onTransformEnd={creerOnTransformEnd("cta", { w: boiteCTA.w, h: boiteCTA.h })}
          >
            <Rect width={px(boiteCTA.w)} height={px(boiteCTA.h)} fill={couleurCTA} cornerRadius={px(boiteCTA.h) / 2} />
            <Text
              text={cta}
              width={px(boiteCTA.w)}
              height={px(boiteCTA.h)}
              verticalAlign="middle"
              align="center"
              fontSize={px(tailleDesc)}
              fontFamily={police}
              fontStyle="bold"
              fill={couleurTexteCTA}
              listening={false}
            />
          </Group>
        )}

        {/* Poignées de sélection — largeur seule pour le texte, coins pour photo/CTA. */}
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          flipEnabled={false}
          enabledAnchors={
            selection === "titre" || selection === "desc"
              ? ["middle-left", "middle-right"]
              : ["top-left", "top-right", "bottom-left", "bottom-right"]
          }
          boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
        />
      </Layer>
    </Stage>
  );
});

export default KonvaCanvas;
