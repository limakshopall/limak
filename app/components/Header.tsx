// ============================================================
//  EN-TÊTE DU SITE — commun à toutes les pages
//  Compte via Clerk 7 : <Show when="signed-in/out">.
// ============================================================

"use client";

import Link from "next/link";
import { useCart } from "../lib/cart-context";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="border-b border-[#14213D]/10 bg-[#FFFBF3]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-[#14213D]">
          LIMAK
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href="/produits"
            className="text-sm text-neutral-700 hover:text-[#14213D]"
          >
            Produits
          </Link>

          <Link
            href="/panier"
            className="relative text-sm text-neutral-700 hover:text-[#14213D]"
          >
            Panier
            {count > 0 && (
              <span className="absolute -right-4 -top-2 rounded-full bg-[#D6293E] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          {/* Si NON connecté : Connexion / Créer un compte */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-sm text-neutral-700 hover:text-[#14213D]">
                Connexion
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-[#F1720A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#C95900]">
                Créer un compte
              </button>
            </SignUpButton>
          </Show>

          {/* Si connecté : Mes commandes + menu utilisateur */}
          <Show when="signed-in">
            <Link
              href="/mes-commandes"
              className="text-sm text-neutral-700 hover:text-[#14213D]"
            >
              Mes commandes
            </Link>
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
