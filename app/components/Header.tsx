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
import MenuLateral from "./MenuLateral";

function IconeArticles({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

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

export default function Header({
  categories = [],
}: {
  categories?: { name: string; slug: string }[];
}) {
  const { count } = useCart();

  return (
    <header className="border-b border-[#14213D]/15 bg-gradient-to-r from-[#D9A93B] via-[#C9962B] to-[#B9862B]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:py-4">
        <div className="flex shrink-0 items-center gap-3">
          <MenuLateral categories={categories} />
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 text-lg font-extrabold tracking-tight text-[#14213D] sm:gap-2 sm:text-xl"
          >
            <Image src="/icon-192.png" alt="" width={40} height={40} priority className="h-9 w-9 sm:h-11 sm:w-11" />
            LIMAK
          </Link>
        </div>

        <nav className="flex shrink-0 items-center gap-3 sm:gap-5">
          <Link
            href="/produits"
            className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-[#14213D] hover:text-white"
          >
            <IconeArticles className="h-5 w-5" />
            <span>Articles</span>
          </Link>

          <Link
            href="/panier"
            aria-label="Panier"
            className="relative flex items-center gap-1.5 text-[#14213D] hover:text-white"
          >
            <IconePanier className="h-5 w-5" />
            <span className="hidden whitespace-nowrap text-sm font-medium sm:inline">Panier</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D6293E] px-1 text-[10px] font-semibold text-white sm:-right-4">
                {count}
              </span>
            )}
          </Link>

          {/* Si NON connecté : Connexion / Créer un compte */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button aria-label="Connexion" className="flex items-center gap-1.5 text-[#14213D] hover:text-white">
                <IconeCompte className="h-5 w-5" />
                <span className="hidden whitespace-nowrap text-sm font-medium sm:inline">Connexion</span>
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="shrink-0 whitespace-nowrap rounded-full bg-[#14213D] px-3 py-1.5 text-xs font-semibold text-[#D9A93B] hover:bg-[#0d1730] sm:px-4 sm:text-sm">
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
              className="text-[#14213D] hover:text-white"
            >
              <IconeCommandes className="h-5 w-5 sm:hidden" />
              <span className="hidden whitespace-nowrap text-sm font-medium sm:inline">Mes commandes</span>
            </Link>
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
