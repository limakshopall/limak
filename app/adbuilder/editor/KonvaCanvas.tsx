// ============================================================
//  ADBUILDER — CANVAS KONVA (Client Component, chargé en un bloc)
//  Isolé dans son propre fichier : react-konva utilise un moteur de
//  rendu React personnalisé (comme react-three-fiber) qui casse si
//  on charge Stage/Layer/Rect/Text/Image séparément via next/dynamic.
//  Cette page l'importe en un seul bloc, avec ssr:false.
// ============================================================

"use client";

import { forwardRef } from "react";
import { Stage, Layer, Rect, Text, Image as KImage } from "react-konva";
import type Konva from "konva";
import { LARGEUR_EXPORT, HAUTEUR_EXPORT } from "../../lib/canvasUtils";

type Boite = { x: number; y: number; w: number; h: number };

export type ProprietesCanvas = {
  largeurAffichage: number;
  hauteurAffichage: number;
  echelleAffichage: number;
  fond: string;
  couleurTexte: string;
  image: HTMLImageElement | null;
  boiteImage: Boite;
  imageAjustee: { largeur: number; hauteur: number } | null;
  banniereOverlay: boolean;
  titre: string;
  boiteTitre: { x: number; y: number; w: number };
  description: string;
  boiteDesc: { x: number; y: number; w: number };
  alignTexte: "left" | "center";
};

const KonvaCanvas = forwardRef<Konva.Stage, ProprietesCanvas>(function KonvaCanvas(
  {
    largeurAffichage,
    hauteurAffichage,
    echelleAffichage,
    fond,
    couleurTexte,
    image,
    boiteImage,
    imageAjustee,
    banniereOverlay,
    titre,
    boiteTitre,
    description,
    boiteDesc,
    alignTexte,
  },
  ref
) {
  const px = (n: number) => n * echelleAffichage;

  return (
    <Stage ref={ref} width={largeurAffichage} height={hauteurAffichage}>
      <Layer>
        <Rect
          x={0}
          y={0}
          width={LARGEUR_EXPORT}
          height={HAUTEUR_EXPORT}
          fill={fond}
          scaleX={echelleAffichage}
          scaleY={echelleAffichage}
        />

        {image && imageAjustee && (
          <KImage
            image={image}
            x={px(boiteImage.x + (boiteImage.w - imageAjustee.largeur) / 2)}
            y={px(boiteImage.y + (boiteImage.h - imageAjustee.hauteur) / 2)}
            width={px(imageAjustee.largeur)}
            height={px(imageAjustee.hauteur)}
          />
        )}

        {!image && (
          <Rect
            x={px(boiteImage.x)}
            y={px(boiteImage.y)}
            width={px(boiteImage.w)}
            height={px(boiteImage.h)}
            fill={fond === "#FBEEDA" ? "#F1E4C8" : "rgba(255,255,255,0.12)"}
            dash={[8, 6]}
            stroke={couleurTexte}
            strokeWidth={1}
          />
        )}

        {banniereOverlay && (
          <Rect
            x={0}
            y={px(HAUTEUR_EXPORT - 380)}
            width={px(LARGEUR_EXPORT)}
            height={px(380)}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: px(380) }}
            fillLinearGradientColorStops={[0, "rgba(20,33,61,0)", 1, "rgba(20,33,61,0.85)"]}
          />
        )}

        <Text
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
        <Text
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
  );
});

export default KonvaCanvas;
