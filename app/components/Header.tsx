// ============================================================
//  EN-TÊTE DU SITE — commun à toutes les pages
//  Compte via Clerk 7 : <Show when="signed-in/out">.
//  Sur mobile : icônes seules (pas de texte) pour ne pas se
//  bousculer sur petit écran. Sur ordinateur : texte complet.
// ============================================================

"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "../lib/cart-context";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

function IconePanier({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconeCompte({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconeCommandes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

export default function Header() {
  const { count } = useCart();

  return (
    <header className="border-b border-[#14213D]/10 bg-[#FFFBF3]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:py-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 text-lg font-extrabold tracking-tight text-[#14213D] sm:gap-2 sm:text-xl"
        >
          <Image src="/icon-192.png" alt="" width={28} height={28} priority className="h-7 w-7 sm:h-8 sm:w-8" />
          LIMAK
        </Link>

        <nav className="flex shrink-0 items-center gap-3 sm:gap-5">
          <Link
            href="/produits"
            className="whitespace-nowrap text-sm text-neutral-700 hover:text-[#14213D]"
          >
            Produits
          </Link>

          <Link
            href="/panier"
            aria-label="Panier"
            className="relative text-neutral-700 hover:text-[#14213D]"
          >
            <IconePanier className="h-5 w-5 sm:hidden" />
            <span className="hidden whitespace-nowrap text-sm sm:inline">Panier</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D6293E] px-1 text-[10px] font-semibold text-white sm:-right-4">
                {count}
              </span>
            )}
          </Link>

          {/* Si NON connecté : Connexion / Créer un compte */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button aria-label="Connexion" className="text-neutral-700 hover:text-[#14213D]">
                <IconeCompte className="h-5 w-5 sm:hidden" />
                <span className="hidden whitespace-nowrap text-sm sm:inline">Connexion</span>
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="shrink-0 whitespace-nowrap rounded-full bg-[#F1720A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#C95900] sm:px-4 sm:text-sm">
                <span className="sm:hidden">S&apos;inscrire</span>
                <span className="hidden sm:inline">Créer un compte</span>
              </button>
            </SignUpButton>
          </Show>

          {/* Si connecté : Mes commandes + menu utilisateur */}
          <Show when="signed-in">
            <Link
              href="/mes-commandes"
              aria-label="Mes commandes"
              className="text-neutral-700 hover:text-[#14213D]"
            >
              <IconeCommandes className="h-5 w-5 sm:hidden" />
              <span className="hidden whitespace-nowrap text-sm sm:inline">Mes commandes</span>
            </Link>
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
