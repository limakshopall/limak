// ============================================================
//  PAGE PANIER  ->  /panier
//  Client Component : lit et modifie le panier partagé.
// ============================================================

"use client";

import Link from "next/link";
import { useCart } from "../lib/cart-context";

export default function PanierPage() {
  const { items, updateQuantity, removeItem, total, count } = useCart();

  if (count === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#14213D]">Votre panier est vide</h1>
        <p className="mt-2 text-gray-500">
          Parcourez le catalogue pour ajouter des articles.
        </p>
        <Link
          href="/produits"
          className="mt-6 inline-block rounded-lg bg-[#F1720A] px-6 py-3 font-medium text-white hover:bg-[#C95900]"
        >
          Voir les produits
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-[#14213D]">Votre panier</h1>

      <div className="space-y-4">
        {items.map((item) => {
          // Est-on à la limite du stock connu pour cet article ?
          const auMax = item.stock != null && item.quantity >= item.stock;

          return (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-lg border border-[#14213D]/10 bg-[#FFFBF3] p-3"
            >
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/produits/${item.slug}`}
                  className="block truncate font-medium text-gray-800 hover:underline"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-gray-500">
                  {new Intl.NumberFormat("fr-FR").format(item.price)} FCFA
                </p>
                {auMax && (
                  <p className="mt-1 text-xs font-medium text-[#D6293E]">
                    Stock maximum atteint
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="h-8 w-8 rounded border border-gray-300 text-lg leading-none hover:bg-gray-100"
                >
                  −
                </button>
                <span className="w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={auMax}
                  title={auMax ? "Stock maximum atteint" : undefined}
                  className="h-8 w-8 rounded border border-gray-300 text-lg leading-none hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <div className="w-28 text-right font-semibold">
                {new Intl.NumberFormat("fr-FR").format(item.price * item.quantity)} FCFA
              </div>

              <button
                onClick={() => removeItem(item.productId)}
                className="ml-2 text-sm text-gray-400 hover:text-red-600"
                aria-label="Retirer l'article"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-[#14213D]/10 pt-6">
        <div className="flex items-center justify-between text-lg font-bold text-[#14213D]">
          <span>Total</span>
          <span>{new Intl.NumberFormat("fr-FR").format(total)} FCFA</span>
        </div>

        <Link
          href="/commande"
          className="mt-6 block w-full rounded-lg bg-[#F1720A] px-6 py-3 text-center font-medium text-white hover:bg-[#C95900]"
        >
          Passer la commande
        </Link>

        <Link
          href="/produits"
          className="mt-3 block text-center text-sm text-gray-500 hover:text-gray-800"
        >
          Continuer mes achats
        </Link>
      </div>
    </main>
  );
}