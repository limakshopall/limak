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
      <main className="mx-auto max-w-3xl bg-[#FBEEDA] px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#14213D]">Votre panier est vide</h1>
        <p className="mt-2 text-neutral-500">
          Parcourez le catalogue pour ajouter des articles.
        </p>
        <Link
          href="/produits"
          className="mt-6 inline-block rounded-full bg-[#F1720A] px-6 py-3 font-semibold text-white transition hover:bg-[#C95900]"
        >
          Voir les produits
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl bg-[#FBEEDA] px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[#14213D]">Votre panier</h1>

      <div className="space-y-3">
        {items.map((item) => {
          // Est-on à la limite du stock connu pour cet article ?
          const auMax = item.stock != null && item.quantity >= item.stock;

          return (
            <div
              key={item.variantId}
              className="flex items-center gap-3 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-3 shadow-sm"
            >
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#FBEEDA] sm:h-20 sm:w-20">
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
                  className="block truncate text-sm font-medium text-[#14213D] hover:underline sm:text-base"
                >
                  {item.name}
                </Link>
                {item.variantLabel && (
                  <p className="mt-0.5 text-xs text-neutral-500">{item.variantLabel}</p>
                )}
                <p className="mt-1 text-sm text-neutral-500">
                  {new Intl.NumberFormat("fr-FR").format(item.price)} FCFA
                </p>
                {auMax && (
                  <p className="mt-1 text-xs font-medium text-[#D6293E]">
                    Stock maximum atteint
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  className="h-7 w-7 rounded-full border border-[#14213D]/20 text-lg leading-none text-[#14213D] hover:bg-[#14213D]/5 sm:h-8 sm:w-8"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm sm:w-6">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  disabled={auMax}
                  title={auMax ? "Stock maximum atteint" : undefined}
                  className="h-7 w-7 rounded-full border border-[#14213D]/20 text-lg leading-none text-[#14213D] hover:bg-[#14213D]/5 disabled:cursor-not-allowed disabled:opacity-30 sm:h-8 sm:w-8"
                >
                  +
                </button>
              </div>

              <div className="hidden w-24 shrink-0 text-right text-sm font-semibold text-[#14213D] sm:block sm:w-28">
                {new Intl.NumberFormat("fr-FR").format(item.price * item.quantity)} FCFA
              </div>

              <button
                onClick={() => removeItem(item.variantId)}
                className="ml-1 shrink-0 text-sm text-neutral-400 hover:text-[#D6293E]"
                aria-label="Retirer l'article"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm">
        <div className="flex items-center justify-between text-lg font-bold text-[#14213D]">
          <span>Total</span>
          <span>{new Intl.NumberFormat("fr-FR").format(total)} FCFA</span>
        </div>

        <Link
          href="/commande"
          className="mt-4 block w-full rounded-full bg-[#F1720A] px-6 py-3 text-center font-semibold text-white transition hover:bg-[#C95900]"
        >
          Passer la commande
        </Link>

        <Link
          href="/produits"
          className="mt-3 block text-center text-sm text-neutral-500 hover:text-[#14213D]"
        >
          Continuer mes achats
        </Link>
      </div>
    </main>
  );
}