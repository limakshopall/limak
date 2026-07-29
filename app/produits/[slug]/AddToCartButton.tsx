// ============================================================
//  BOUTON "AJOUTER AU PANIER" — Client Component (interactif)
//  Sélecteur de quantité bridé au stock disponible.
// ============================================================

"use client";

import { useState } from "react";
import { useCart } from "../../lib/cart-context";

type Props = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
};

export default function AddToCartButton({
  productId,
  slug,
  name,
  price,
  image,
  stock,
}: Props) {
  const { addItem } = useCart();
  const [ajoute, setAjoute] = useState(false);
  const [quantite, setQuantite] = useState(1);

  const epuise = stock <= 0;

  function diminuer() {
    setQuantite((q) => Math.max(1, q - 1));
  }
  function augmenter() {
    setQuantite((q) => Math.min(stock, q + 1)); // jamais au-dessus du stock
  }

  function handleClick() {
    if (epuise) return;
    // Sécurité : on n'ajoute jamais plus que le stock.
    const qteFinale = Math.min(quantite, stock);
    for (let i = 0; i < qteFinale; i++) {
      addItem({ productId, slug, name, price, image });
    }
    setAjoute(true);
    setTimeout(() => setAjoute(false), 1500);
  }

  return (
    <div className="mt-8">
      {/* Repère "il reste peu" quand le stock est faible (mais > 0) */}
      {!epuise && stock <= 5 && (
        <p className="mb-3 text-sm font-medium text-orange-600">
          Plus que {stock} en stock — commandez vite !
        </p>
      )}

      {/* Sélecteur de quantité (caché si épuisé) */}
      {!epuise && (
        <div className="mb-4 flex items-center gap-4">
          <span className="text-sm text-gray-600">Quantité</span>
          <div className="flex items-center rounded-lg border border-gray-300">
            <button
              type="button"
              onClick={diminuer}
              disabled={quantite <= 1}
              className="px-3 py-2 text-lg text-gray-700 disabled:opacity-30"
              aria-label="Diminuer la quantité"
            >
              −
            </button>
            <span className="w-10 text-center font-medium">{quantite}</span>
            <button
              type="button"
              onClick={augmenter}
              disabled={quantite >= stock}
              className="px-3 py-2 text-lg text-gray-700 disabled:opacity-30"
              aria-label="Augmenter la quantité"
            >
              +
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={epuise}
        className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {epuise ? "Rupture de stock" : ajoute ? "Ajouté ✓" : "Ajouter au panier"}
      </button>
    </div>
  );
}