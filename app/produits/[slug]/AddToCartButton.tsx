// ============================================================
//  SÉLECTEUR DE VARIANTE + "AJOUTER AU PANIER" — Client Component
//  Produit simple (1 variante) -> juste quantité + bouton.
//  Produit décliné (couleur/taille) -> pastilles + boutons avant.
// ============================================================

"use client";

import { useMemo, useState } from "react";
import { useCart } from "../../lib/cart-context";

type Variant = {
  id: string;
  color: string | null;
  size: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
};

type Props = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  variants: Variant[];
};

function fcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function AddToCartButton({ productId, slug, name, image, variants }: Props) {
  const { addItem } = useCart();
  const [ajoute, setAjoute] = useState(false);
  const [quantite, setQuantite] = useState(1);

  const couleurs = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter((c): c is string => !!c))),
    [variants]
  );
  const tailles = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter((s): s is string => !!s))),
    [variants]
  );

  const [couleurChoisie, setCouleurChoisie] = useState<string | null>(couleurs[0] ?? null);
  const [tailleChoisie, setTailleChoisie] = useState<string | null>(tailles[0] ?? null);

  const variant = variants.find(
    (v) =>
      (couleurs.length === 0 || v.color === couleurChoisie) &&
      (tailles.length === 0 || v.size === tailleChoisie)
  );

  const stock = variant?.stock ?? 0;
  const epuise = !variant || stock <= 0;

  function choisirCouleur(c: string) {
    setCouleurChoisie(c);
    const compatible = variants.some((v) => v.color === c && v.size === tailleChoisie);
    if (!compatible) {
      setTailleChoisie(variants.find((v) => v.color === c)?.size ?? null);
    }
  }

  function choisirTaille(s: string) {
    setTailleChoisie(s);
    const compatible = variants.some((v) => v.size === s && v.color === couleurChoisie);
    if (!compatible) {
      setCouleurChoisie(variants.find((v) => v.size === s)?.color ?? null);
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
    const variantLabel = [variant.color, variant.size].filter(Boolean).join(" / ") || null;
    const qteFinale = Math.min(quantite, stock);
    for (let i = 0; i < qteFinale; i++) {
      addItem({
        productId,
        variantId: variant.id,
        variantLabel,
        slug,
        name,
        price: variant.price,
        image,
        stock,
      });
    }
    setAjoute(true);
    setTimeout(() => setAjoute(false), 1500);
  }

  return (
    <div className="mt-4">
      {variant && (
        <div className="mb-4 flex items-baseline gap-3">
          <p className="text-3xl font-semibold text-[#14213D]">{fcfa(variant.price)}</p>
          {variant.comparePrice != null && variant.comparePrice > variant.price && (
            <>
              <p className="text-lg text-neutral-400 line-through">{fcfa(variant.comparePrice)}</p>
              <span className="rounded-full bg-[#D6293E] px-2 py-0.5 text-sm font-bold text-white">
                -{Math.round(((variant.comparePrice - variant.price) / variant.comparePrice) * 100)}%
              </span>
            </>
          )}
        </div>
      )}

      {couleurs.length > 0 && (
        <div className="mb-4">
          <p className="mb-1.5 text-sm text-neutral-600">
            Couleur{couleurChoisie ? ` : ${couleurChoisie}` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {couleurs.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => choisirCouleur(c)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  c === couleurChoisie
                    ? "border-[#14213D] bg-[#14213D] text-white"
                    : "border-[#14213D]/20 text-[#14213D] hover:border-[#14213D]/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {tailles.length > 0 && (
        <div className="mb-4">
          <p className="mb-1.5 text-sm text-neutral-600">Taille</p>
          <div className="flex flex-wrap gap-2">
            {tailles.map((s) => {
              // Une taille est indisponible si elle n'existe pas / plus de stock pour la couleur choisie.
              const v = variants.find(
                (x) => x.size === s && (couleurs.length === 0 || x.color === couleurChoisie)
              );
              const indispo = !v || v.stock <= 0;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => choisirTaille(s)}
                  disabled={indispo}
                  title={indispo ? "Indisponible pour cette couleur" : undefined}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-30 ${
                    s === tailleChoisie
                      ? "border-[#14213D] bg-[#14213D] text-white"
                      : "border-[#14213D]/20 text-[#14213D] hover:border-[#14213D]/40"
                  }`}
                >
                  {s}
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
              <span className="text-sm text-neutral-600">Quantité</span>
              <div className="flex items-center rounded-lg border border-[#14213D]/15">
                <button
                  type="button"
                  onClick={diminuer}
                  disabled={quantite <= 1}
                  className="px-3 py-2 text-lg text-[#14213D] disabled:opacity-30"
                  aria-label="Diminuer la quantité"
                >
                  −
                </button>
                <span className="w-10 text-center font-medium text-[#14213D]">{quantite}</span>
                <button
                  type="button"
                  onClick={augmenter}
                  disabled={quantite >= stock}
                  className="px-3 py-2 text-lg text-[#14213D] disabled:opacity-30"
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
  );
}
