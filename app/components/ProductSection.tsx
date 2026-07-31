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
  stock: number;
  note?: Note;
};

export type Disposition = "grille" | "scroll" | "decale" | "cercle";

export default function ProductSection({
  produits,
  disposition,
}: {
  produits: Produit[];
  disposition: Disposition;
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
      {produits.map((p, i) => (
        <div key={p.id} className={disposition === "decale" && i % 2 === 1 ? "mt-5" : ""}>
          <ProductCard
            slug={p.slug}
            name={p.name}
            price={p.price}
            comparePrice={p.comparePrice}
            imageUrl={p.imageUrl}
            imageAlt={p.imageAlt}
            note={p.note}
            stock={p.stock}
          />
        </div>
      ))}
    </div>
  );
}
