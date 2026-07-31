// ============================================================
//  MENU LATÉRAL (tiroir) — Client Component
//  Icône ☰ dans l'en-tête -> panneau glissant depuis la gauche
//  avec les catégories + liens de compte. Présent sur toutes les pages.
// ============================================================

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Categorie = { name: string; slug: string };

function IconeMenu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function IconeTout({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconeEtiquette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L4 3a1 1 0 0 0-1 1l.24 5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.34a2 2 0 0 0 0-2.83Z" />
      <circle cx="8" cy="8" r="1.5" />
    </svg>
  );
}

function IconePanierMenu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconeCommandesMenu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

export default function MenuLateral({ categories }: { categories: Categorie[] }) {
  const [ouvert, setOuvert] = useState(false);

  // Bloque le défilement de la page derrière le tiroir + ferme sur Échap.
  useEffect(() => {
    if (!ouvert) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOuvert(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [ouvert]);

  return (
    <>
      <button
        onClick={() => setOuvert(true)}
        aria-label="Ouvrir le menu"
        className="shrink-0 text-[#14213D] hover:text-white"
      >
        <IconeMenu className="h-5.5 w-5.5" />
      </button>

      <div
        onClick={() => setOuvert(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-[#14213D]/50 transition-opacity duration-300 ${
          ouvert ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-hidden={!ouvert}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-[#FFFBF3] shadow-xl transition-transform duration-300 ease-out ${
          ouvert ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 px-4 py-4">
          <span className="text-lg font-extrabold tracking-tight text-[#14213D]">LIMAK</span>
          <button
            onClick={() => setOuvert(false)}
            aria-label="Fermer le menu"
            className="text-neutral-500 hover:text-[#14213D]"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <Link
            href="/produits"
            onClick={() => setOuvert(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-[#14213D] transition hover:bg-[#14213D]/5"
          >
            <IconeTout className="h-4.5 w-4.5 shrink-0" />
            Tous les produits
          </Link>

          <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Catégories
          </p>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/produits?categorie=${c.slug}`}
              onClick={() => setOuvert(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-700 transition hover:bg-[#14213D]/5 hover:text-[#14213D]"
            >
              <IconeEtiquette className="h-4.5 w-4.5 shrink-0" />
              {c.name}
            </Link>
          ))}

          <div className="my-3 border-t border-[#14213D]/10" />

          <Link
            href="/panier"
            onClick={() => setOuvert(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-700 transition hover:bg-[#14213D]/5 hover:text-[#14213D]"
          >
            <IconePanierMenu className="h-4.5 w-4.5 shrink-0" />
            Panier
          </Link>
          <Link
            href="/mes-commandes"
            onClick={() => setOuvert(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-700 transition hover:bg-[#14213D]/5 hover:text-[#14213D]"
          >
            <IconeCommandesMenu className="h-4.5 w-4.5 shrink-0" />
            Mes commandes
          </Link>
        </nav>

        <div className="border-t border-[#14213D]/10 px-4 py-4 text-xs text-neutral-400">
          Paiement à la livraison · Côte d&apos;Ivoire 🇨🇮
        </div>
      </aside>
    </>
  );
}
