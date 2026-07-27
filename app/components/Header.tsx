// ============================================================
//  EN-TÊTE DU SITE — commun à toutes les pages
//  Client Component : il lit le panier pour afficher le compteur.
// ============================================================

"use client";

import Link from "next/link";
import { useCart } from "../lib/cart-context";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          LIMAK
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/produits"
            className="text-sm text-gray-700 hover:text-black"
          >
            Produits
          </Link>

          <Link
            href="/panier"
            className="relative text-sm text-gray-700 hover:text-black"
          >
            Panier
            {/* Petite pastille avec le nombre d'articles */}
            {count > 0 && (
              <span className="absolute -right-4 -top-2 rounded-full bg-black px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
