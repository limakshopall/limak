// ============================================================
//  SECTION PRODUITS — disposition variable selon la section
//  "grille" : grille classique · "scroll" : défilement horizontal
//  "decale" : cartes décalées (effet zig-zag)
//  Une seule carte produit (ProductCard) partout, pour une présentation
//  cohérente d'une section à l'autre.
// ============================================================

import ProductCard from "./ProductCard";

type Note = { moyenne: number; nb: number };

type Produit = {
  id: string;
  slug: string;
  colorId?: string | null;
  name: string;
  price: number;
  comparePrice: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  stock: number;
  note?: Note;
};

export type Disposition = "grille" | "scroll" | "decale";

// Motifs de tuiles "grandes" (sur 8 positions) : change d'un bloc à l'autre
// pour que la grille ne se répète pas exactement de la même façon partout.
const MOTIFS_TAILLE: number[][] = [
  [0, 5],
  [2, 6],
  [1, 4, 7],
  [3],
];

function estGrande(i: number, variante: number) {
  const motif = MOTIFS_TAILLE[variante % MOTIFS_TAILLE.length];
  return motif.includes(i % 8);
}

export default function ProductSection({
  produits,
  disposition,
  variante = 0,
}: {
  produits: Produit[];
  disposition: Disposition;
  variante?: number;
}) {
  if (disposition === "scroll") {
    return (
      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {produits.map((p) => (
          <div key={p.id} className="w-[42%] shrink-0 snap-start sm:w-[190px]">
            <ProductCard
              slug={p.slug}
              colorId={p.colorId}
              name={p.name}
              price={p.price}
              comparePrice={p.comparePrice}
              imageUrl={p.imageUrl}
              imageAlt={p.imageAlt}
              imageWidth={p.imageWidth}
              imageHeight={p.imageHeight}
              note={p.note}
              stock={p.stock}
            />
          </div>
        ))}
      </div>
    );
  }

  // "grille" (classique) et "decale" (zig-zag) partagent la même grille de base
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {produits.map((p, i) => {
        const grande = estGrande(i, variante);
        return (
          <div
            key={p.id}
            className={`${grande ? "col-span-2" : ""} ${
              disposition === "decale" && i % 2 === 1 && !grande ? "mt-5" : ""
            }`}
          >
            <ProductCard
              slug={p.slug}
              colorId={p.colorId}
              name={p.name}
              price={p.price}
              comparePrice={p.comparePrice}
              imageUrl={p.imageUrl}
              imageAlt={p.imageAlt}
              imageWidth={p.imageWidth}
              imageHeight={p.imageHeight}
              note={p.note}
              stock={p.stock}
              large={grande}
            />
          </div>
        );
      })}
    </div>
  );
}
