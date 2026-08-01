// ============================================================
//  SECTION PRODUITS — disposition variable selon la section
//  "grille" : grille classique · "scroll" : défilement horizontal
//  "decale" : cartes décalées (effet zig-zag) · "cercle" : vignettes rondes
//  But : casser la monotonie visuelle en descendant la page (catalogue).
// ============================================================

import ProductCard from "./ProductCard";
import ProductCardCercle from "./ProductCardCercle";

type Note = { moyenne: number; nb: number };

type Produit = {
  id: string;
  slug: string;
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

export type Disposition = "grille" | "scroll" | "decale" | "cercle";

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

  if (disposition === "cercle") {
    return (
      <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {produits.map((p) => (
          <ProductCardCercle
            key={p.id}
            slug={p.slug}
            name={p.name}
            price={p.price}
            imageUrl={p.imageUrl}
            imageAlt={p.imageAlt}
          />
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
