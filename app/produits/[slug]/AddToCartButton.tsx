// ============================================================
//  BOUTON "AJOUTER AU PANIER" — Client Component (interactif)
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

  function handleClick() {
    addItem({ productId, slug, name, price, image });
    // Petit retour visuel : "Ajouté ✓" pendant 1,5 seconde
    setAjoute(true);
    setTimeout(() => setAjoute(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      disabled={stock === 0}
      className="mt-8 w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
    >
      {stock === 0 ? "Rupture de stock" : ajoute ? "Ajouté ✓" : "Ajouter au panier"}
    </button>
  );
}
