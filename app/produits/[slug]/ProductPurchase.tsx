// ============================================================
//  ZONE D'ACHAT PRODUIT — Client Component
//  Fusionne galerie + sélecteur couleur/taille + panier :
//  cliquer une couleur change les photos affichées, le prix et
//  le stock suivent la combinaison couleur/taille choisie.
// ============================================================

"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useCart } from "../../lib/cart-context";
import ProductGallery from "./ProductGallery";

type Img = { id: string; url: string; alt: string | null };
type ColorOption = { id: string; name: string; hex: string | null; images: Img[] };
type SizeOption = { id: string; name: string; images: Img[] };
type VariantOption = {
  id: string;
  colorId: string | null;
  sizeId: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
};

type Props = {
  productId: string;
  slug: string;
  name: string;
  fallbackImages: Img[];
  colors: ColorOption[];
  sizes: SizeOption[];
  variants: VariantOption[];
  initialColorId?: string | null;
  before?: ReactNode;
  after?: ReactNode;
};

function fcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function ProductPurchase({
  productId,
  slug,
  name,
  fallbackImages,
  colors,
  sizes,
  variants,
  initialColorId,
  before,
  after,
}: Props) {
  const { addItem } = useCart();
  const [ajoute, setAjoute] = useState(false);
  const [quantite, setQuantite] = useState(1);

  // Si on arrive depuis une carte "couleur" précise (catalogue/accueil), on démarre sur cette couleur.
  const couleurDepart =
    (initialColorId && colors.some((c) => c.id === initialColorId) ? initialColorId : null) ??
    colors[0]?.id ??
    null;
  const [colorId, setColorId] = useState<string | null>(couleurDepart);
  const [sizeId, setSizeId] = useState<string | null>(
    sizes.find((s) => variants.some((v) => v.sizeId === s.id && v.colorId === couleurDepart))?.id ??
      sizes[0]?.id ??
      null
  );

  const variant = variants.find(
    (v) =>
      (colors.length === 0 || v.colorId === colorId) &&
      (sizes.length === 0 || v.sizeId === sizeId)
  );

  const stock = variant?.stock ?? 0;
  const epuise = !variant || stock <= 0;

  const selectedColor = colors.find((c) => c.id === colorId) ?? null;
  const selectedSize = sizes.find((s) => s.id === sizeId) ?? null;
  const images = useMemo(() => {
    if (selectedColor && selectedColor.images.length > 0) return selectedColor.images;
    if (selectedSize && selectedSize.images.length > 0) return selectedSize.images;
    return fallbackImages;
  }, [selectedColor, selectedSize, fallbackImages]);

  function choisirCouleur(id: string) {
    setColorId(id);
    const compatible = variants.some((v) => v.colorId === id && v.sizeId === sizeId);
    if (!compatible) {
      setSizeId(variants.find((v) => v.colorId === id)?.sizeId ?? null);
    }
  }

  function choisirTaille(id: string) {
    setSizeId(id);
    const compatible = variants.some((v) => v.sizeId === id && v.colorId === colorId);
    if (!compatible) {
      setColorId(variants.find((v) => v.sizeId === id)?.colorId ?? null);
    }
  }

  function diminuer() {
    setQuantite((q) => Math.max(1, q - 1));
  }
  function augmenter() {
    setQuantite((q) => Math.min(stock, q + 1));
  }

  function handleClick() {
    if (!variant || epuise) return;
    const variantLabel = [selectedColor?.name, selectedSize?.name].filter(Boolean).join(" / ") || null;
    const qteFinale = Math.min(quantite, stock);
    for (let i = 0; i < qteFinale; i++) {
      addItem({
        productId,
        variantId: variant.id,
        variantLabel,
        slug,
        name,
        price: variant.price,
        image: images[0]?.url ?? null,
        stock,
      });
    }
    setAjoute(true);
    setTimeout(() => setAjoute(false), 1500);
  }

  return (
    <>
      <ProductGallery images={images} name={name} />

      <div>
        {before}

        <div className="mt-4">
          {variant && (
            <div className="mb-4 flex items-baseline gap-3">
              <p className="text-3xl font-extrabold text-[#B9862B]">{fcfa(variant.price)}</p>
              {variant.comparePrice != null && variant.comparePrice > variant.price && (
                <>
                  <p className="text-lg text-neutral-400 line-through dark:text-gray-400">
                    {fcfa(variant.comparePrice)}
                  </p>
                  <span className="rounded-full bg-[#D6293E] px-2 py-0.5 text-sm font-bold text-white">
                    -{Math.round(((variant.comparePrice - variant.price) / variant.comparePrice) * 100)}%
                  </span>
                </>
              )}
            </div>
          )}

          {colors.length > 0 && (
            <div className="mb-4">
              <p className="mb-1.5 text-sm text-neutral-600 dark:text-gray-400">
                Couleur{selectedColor ? ` : ${selectedColor.name}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => choisirCouleur(c.id)}
                    title={c.name}
                    aria-label={c.name}
                    className={`h-9 w-9 rounded-full border-2 transition ${
                      c.id === colorId
                        ? "border-[#14213D] ring-2 ring-[#14213D]/30"
                        : "border-[#14213D]/20 hover:border-[#14213D]/40"
                    }`}
                    style={{ backgroundColor: c.hex ?? "#e5e5e5" }}
                  />
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mb-4">
              <p className="mb-1.5 text-sm text-neutral-600 dark:text-gray-400">Taille</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  // Une taille est indisponible si elle n'existe pas / plus de stock pour la couleur choisie.
                  const v = variants.find(
                    (x) => x.sizeId === s.id && (colors.length === 0 || x.colorId === colorId)
                  );
                  const indispo = !v || v.stock <= 0;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => choisirTaille(s.id)}
                      disabled={indispo}
                      title={indispo ? "Indisponible pour cette couleur" : undefined}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-30 ${
                        s.id === sizeId
                          ? "border-[#14213D] bg-[#14213D] text-white"
                          : "border-[#14213D]/20 text-[#14213D] hover:border-[#14213D]/40 dark:border-white/15 dark:text-gray-300 dark:hover:border-white/20"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!variant ? (
            <p className="mb-3 text-sm font-medium text-[#D6293E]">
              Cette combinaison n&apos;est pas disponible.
            </p>
          ) : (
            <>
              {epuise && (
                <p className="mb-3 text-sm font-medium text-[#D6293E]">
                  Rupture de stock — revient bientôt.
                </p>
              )}
              {!epuise && stock <= 3 && (
                <p className="mb-3 text-sm font-medium text-[#D6293E]">
                  Plus que {stock} en stock — commandez vite !
                </p>
              )}

              {!epuise && (
                <div className="mb-4 flex items-center gap-4">
                  <span className="text-sm text-neutral-600 dark:text-gray-400">Quantité</span>
                  <div className="flex items-center rounded-lg border border-[#14213D]/15 dark:border-white/15">
                    <button
                      type="button"
                      onClick={diminuer}
                      disabled={quantite <= 1}
                      className="px-3 py-2 text-lg text-[#14213D] disabled:opacity-30 dark:text-gray-300"
                      aria-label="Diminuer la quantité"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-medium text-[#14213D] dark:text-gray-300">
                      {quantite}
                    </span>
                    <button
                      type="button"
                      onClick={augmenter}
                      disabled={quantite >= stock}
                      className="px-3 py-2 text-lg text-[#14213D] disabled:opacity-30 dark:text-gray-300"
                      aria-label="Augmenter la quantité"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <button
            onClick={handleClick}
            disabled={epuise}
            className="w-full rounded-lg bg-[#F1720A] px-6 py-3 font-medium text-white transition hover:bg-[#C95900] disabled:opacity-50"
          >
            {epuise ? "Rupture de stock" : ajoute ? "Ajouté ✓" : "Ajouter au panier"}
          </button>
        </div>

        {after}
      </div>
    </>
  );
}
