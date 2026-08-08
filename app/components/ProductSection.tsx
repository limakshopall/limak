// ============================================================
//  SECTION PRODUITS — disposition selon la section
//  "grille" : grille classique, cartes toutes de même taille, alignées
//  "scroll" : défilement horizontal (carrousel)
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
  imageUrlHover?: string | null;
  stock: number;
  isNew?: boolean;
  note?: Note;
};

export type Disposition = "grille" | "scroll";

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
              colorId={p.colorId}
              name={p.name}
              price={p.price}
              comparePrice={p.comparePrice}
              imageUrl={p.imageUrl}
              imageAlt={p.imageAlt}
              imageWidth={p.imageWidth}
              imageHeight={p.imageHeight}
              imageUrlHover={p.imageUrlHover}
              note={p.note}
              stock={p.stock}
              isNew={p.isNew}
            />
          </div>
        ))}
      </div>
    );
  }

  // Grille droite et uniforme : toutes les cartes ont la même taille, pas de
  // décalage ni de tuile géante — l'espace est occupé de façon régulière.
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {produits.map((p) => (
        <ProductCard
          key={p.id}
          slug={p.slug}
          colorId={p.colorId}
          name={p.name}
          price={p.price}
          comparePrice={p.comparePrice}
          imageUrl={p.imageUrl}
          imageAlt={p.imageAlt}
          imageWidth={p.imageWidth}
          imageHeight={p.imageHeight}
          imageUrlHover={p.imageUrlHover}
          note={p.note}
          stock={p.stock}
          isNew={p.isNew}
        />
      ))}
    </div>
  );
}
