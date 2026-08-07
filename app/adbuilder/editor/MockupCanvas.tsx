// ============================================================
//  ADBUILDER — MOCKUPS (téléphone / ordinateur / panneau)
//  Isolé comme KonvaCanvas.tsx : react-konva casse si on charge ses
//  primitives séparément via next/dynamic, donc tout est ici, en
//  imports normaux, et le fichier entier est chargé en un bloc.
// ============================================================

"use client";

import { forwardRef } from "react";
import { Stage, Layer, Rect, Image as KImage } from "react-konva";
import type Konva from "konva";
import type { Context } from "konva/lib/Context";

export type TypeMockup = "telephone" | "ordinateur" | "panneau";

export const TAILLES_MOCKUP: Record<TypeMockup, { w: number; h: number; nom: string }> = {
  telephone: { w: 480, h: 900, nom: "Téléphone" },
  ordinateur: { w: 900, h: 650, nom: "Ordinateur" },
  panneau: { w: 1000, h: 750, nom: "Panneau publicitaire" },
};

// Cover-fit (comme background-size: cover) centré dans une boîte.
function ajusterEnCouverture(img: HTMLImageElement, boiteW: number, boiteH: number) {
  const echelle = Math.max(boiteW / img.width, boiteH / img.height);
  return { largeur: img.width * echelle, hauteur: img.height * echelle };
}

type Props = { type: TypeMockup; image: HTMLImageElement | null };

const MockupCanvas = forwardRef<Konva.Stage, Props>(function MockupCanvas({ type, image }, ref) {
  const { w, h } = TAILLES_MOCKUP[type];

  if (type === "telephone") {
    const ecran = { x: 24, y: 60, w: w - 48, h: h - 120 };
    const ajustee = image ? ajusterEnCouverture(image, ecran.w, ecran.h) : null;
    return (
      <Stage ref={ref} width={w} height={h}>
        <Layer clipFunc={(ctx: Context) => ctx.rect(0, 0, w, h)}>
          <Rect x={0} y={0} width={w} height={h} fill="#F5F5F0" />
          <Rect x={0} y={0} width={w} height={h} fill="#14213D" cornerRadius={44} />
          <Rect x={ecran.x} y={ecran.y} width={ecran.w} height={ecran.h} fill="#000" cornerRadius={18} />
          {image && ajustee && (
            <KImage
              image={image}
              x={ecran.x + (ecran.w - ajustee.largeur) / 2}
              y={ecran.y + (ecran.h - ajustee.hauteur) / 2}
              width={ajustee.largeur}
              height={ajustee.hauteur}
              clipFunc={(ctx: Context) => {
                const r = 18;
                ctx.beginPath();
                ctx.moveTo(ecran.x + r, ecran.y);
                ctx.arcTo(ecran.x + ecran.w, ecran.y, ecran.x + ecran.w, ecran.y + ecran.h, r);
                ctx.arcTo(ecran.x + ecran.w, ecran.y + ecran.h, ecran.x, ecran.y + ecran.h, r);
                ctx.arcTo(ecran.x, ecran.y + ecran.h, ecran.x, ecran.y, r);
                ctx.arcTo(ecran.x, ecran.y, ecran.x + ecran.w, ecran.y, r);
                ctx.closePath();
              }}
            />
          )}
          <Rect x={w / 2 - 45} y={30} width={90} height={20} fill="#14213D" cornerRadius={10} />
        </Layer>
      </Stage>
    );
  }

  if (type === "ordinateur") {
    const ecran = { x: 60, y: 30, w: w - 120, h: h - 160 };
    const ajustee = image ? { largeur: ecran.w, hauteur: (image.height / image.width) * ecran.w } : null;
    const decalageY = ajustee && ajustee.hauteur < ecran.h ? (ecran.h - ajustee.hauteur) / 2 : 0;
    return (
      <Stage ref={ref} width={w} height={h}>
        <Layer>
          <Rect x={0} y={0} width={w} height={h} fill="#EDE7DA" />
          <Rect x={40} y={10} width={w - 80} height={h - 130} fill="#20263A" cornerRadius={10} />
          <Rect x={ecran.x} y={ecran.y + decalageY} width={ecran.w} height={Math.min(ajustee?.hauteur ?? ecran.h, ecran.h)} fill="#000" />
          {image && ajustee && (
            <KImage
              image={image}
              x={ecran.x}
              y={ecran.y + decalageY}
              width={ajustee.largeur}
              height={ajustee.hauteur}
            />
          )}
          {/* base du clavier */}
          <Rect x={10} y={h - 120} width={w - 20} height={16} fill="#B9B2A0" cornerRadius={4} />
          <Rect x={w / 2 - 220} y={h - 104} width={440} height={90} fill="#CFC8B6" cornerRadius={[0, 0, 16, 16]} />
        </Layer>
      </Stage>
    );
  }

  // panneau publicitaire
  const cadre = { x: w * 0.12, y: h * 0.08, w: w * 0.76, h: h * 0.62 };
  const ajustee = image ? ajusterEnCouverture(image, cadre.w, cadre.h) : null;
  return (
    <Stage ref={ref} width={w} height={h}>
      <Layer>
        <Rect
          x={0}
          y={0}
          width={w}
          height={h}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 0, y: h }}
          fillLinearGradientColorStops={[0, "#9FD3F0", 0.6, "#D9EEFB", 1, "#C9C2AE"]}
        />
        {/* pieds du panneau */}
        <Rect x={w * 0.3 - 8} y={cadre.y + cadre.h} width={16} height={h - (cadre.y + cadre.h) - 20} fill="#4A4A4A" />
        <Rect x={w * 0.7 - 8} y={cadre.y + cadre.h} width={16} height={h - (cadre.y + cadre.h) - 20} fill="#4A4A4A" />
        {/* cadre blanc */}
        <Rect x={cadre.x - 14} y={cadre.y - 14} width={cadre.w + 28} height={cadre.h + 28} fill="#FFFFFF" shadowBlur={20} shadowOpacity={0.25} />
        <Rect x={cadre.x} y={cadre.y} width={cadre.w} height={cadre.h} fill="#EFEFEF" stroke="#CCCCCC" strokeWidth={1} />
        {image && ajustee && (
          <KImage
            image={image}
            x={cadre.x + (cadre.w - ajustee.largeur) / 2}
            y={cadre.y + (cadre.h - ajustee.hauteur) / 2}
            width={ajustee.largeur}
            height={ajustee.hauteur}
          />
        )}
      </Layer>
    </Stage>
  );
});

export default MockupCanvas;
