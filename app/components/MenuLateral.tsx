// ============================================================
//  MENU LATÉRAL (tiroir) — Client Component
//  Icône ☰ dans l'en-tête -> panneau glissant depuis la gauche
//  avec les catégories + liens de compte. Présent sur toutes les pages.
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useHydrated } from "../lib/useHydrated";

type Categorie = { name: string; slug: string };

function IconeMenu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function IconeAccueil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
      <path d="M9 21v-6h6v6" />
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

// Icônes par catégorie (une par slug connu, IconeEtiquette en secours pour les autres).
function IconeMontres({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 10v2.5l1.5 1" />
      <path d="m15.5 7.1-.7-3.5a1.7 1.7 0 0 0-1.7-1.4h-2.2a1.7 1.7 0 0 0-1.7 1.4l-.7 3.5" />
      <path d="m8.5 16.9.7 3.5a1.7 1.7 0 0 0 1.7 1.4h2.2a1.7 1.7 0 0 0 1.7-1.4l.7-3.5" />
    </svg>
  );
}

function IconeSacs({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconeBeaute({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function IconeElectromenager({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" />
      <path d="M5 10h14" />
      <path d="M9 6v3" />
      <path d="M9 14v3" />
    </svg>
  );
}

function IconeLibrairie({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3Z" />
    </svg>
  );
}

function IconeLunettes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6" cy="15" r="4" />
      <circle cx="18" cy="15" r="4" />
      <path d="M14 15a2 2 0 0 0-4 0" />
      <path d="M2.5 13 5 7c.7-1.3 1.4-2 3-2" />
      <path d="M21.5 13 19 7c-.7-1.3-1.5-2-3-2" />
    </svg>
  );
}

function IconeChaussures({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 18c0-1 .5-1.8 1.5-2.2L9 14l3-3.5c.6-.7 1.5-1 2.4-.8l4.6 1c1.2.3 2 1.3 2 2.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
      <path d="M9 14v-4" />
    </svg>
  );
}

function IconeVetements({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 .55.45 1 1 1h10a1 1 0 0 0 1-1V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z" />
    </svg>
  );
}

function IconeAccessoires({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 3 9 2 14 2 17 3 16 6 18 8 21 9 18 12 19 14 17 18 15 21 12 23 10 21 9 18 8 15 9 13 7 12 5 13 4 11 2 9 3 6 4 4Z" />
      <path d="M19.5 16.5 21 18 20 21 18.5 19Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ICONES_CATEGORIES: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  montres: IconeMontres,
  sacs: IconeSacs,
  beauty: IconeBeaute,
  electromenager: IconeElectromenager,
  librairie: IconeLibrairie,
  lunettes: IconeLunettes,
  chaussures: IconeChaussures,
  vetements: IconeVetements,
  "accessoires-traditionnelles": IconeAccessoires,
};

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

function IconeAmis({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16.5 5.5a3.5 3.5 0 0 1 0 6.9" />
      <path d="M18.5 13.2a6.5 6.5 0 0 1 3 5.6" />
    </svg>
  );
}

export default function MenuLateral({ categories }: { categories: Categorie[] }) {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  // Le tiroir est téléporté dans <body> (portail) : le header a un fond flouté
  // (backdrop-blur) qui, sinon, coincerait le "position: fixed" du tiroir dans
  // sa propre hauteur au lieu de couvrir tout l'écran.
  const monte = useHydrated();

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

  const tiroir = (
    <>
      <div
        onClick={() => setOuvert(false)}
        aria-hidden
        className={`fixed inset-0 z-40 bg-[#14213D]/50 transition-opacity duration-300 ${
          ouvert ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-hidden={!ouvert}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-[#FFFBF3] shadow-xl transition-transform duration-300 ease-out dark:bg-[#1c2333] ${
          ouvert ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#14213D]/10 px-4 py-4 dark:border-white/15">
          <span className="text-lg font-extrabold tracking-tight text-[#14213D] dark:text-gray-300">LIMAK</span>
          <button
            onClick={() => setOuvert(false)}
            aria-label="Fermer le menu"
            className="text-neutral-500 hover:text-[#14213D] dark:text-gray-400 dark:hover:text-gray-100"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {pathname !== "/" && (
            <Link
              href="/"
              onClick={() => setOuvert(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-[#14213D] transition hover:bg-[#14213D]/5 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <IconeAccueil className="h-4.5 w-4.5 shrink-0" />
              Accéder à la page d&apos;accueil
            </Link>
          )}
          <Link
            href="/produits"
            onClick={() => setOuvert(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold text-[#14213D] transition hover:bg-[#14213D]/5 dark:text-gray-300 dark:hover:bg-white/5"
          >
            <IconeTout className="h-4.5 w-4.5 shrink-0" />
            Tous les articles
          </Link>

          <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-gray-400">
            Catégories
          </p>
          {categories.map((c) => {
            const IconeCategorie = ICONES_CATEGORIES[c.slug] ?? IconeEtiquette;
            return (
              <Link
                key={c.slug}
                href={`/produits?categorie=${c.slug}`}
                onClick={() => setOuvert(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-700 transition hover:bg-[#14213D]/5 hover:text-[#14213D] dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-100"
              >
                <IconeCategorie className="h-4.5 w-4.5 shrink-0" />
                {c.name}
              </Link>
            );
          })}

          <div className="my-3 border-t border-[#14213D]/10 dark:border-white/15" />

          <Link
            href="/panier"
            onClick={() => setOuvert(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-700 transition hover:bg-[#14213D]/5 hover:text-[#14213D] dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-100"
          >
            <IconePanierMenu className="h-4.5 w-4.5 shrink-0" />
            Panier
          </Link>
          <Link
            href="/mes-commandes"
            onClick={() => setOuvert(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-700 transition hover:bg-[#14213D]/5 hover:text-[#14213D] dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-100"
          >
            <IconeCommandesMenu className="h-4.5 w-4.5 shrink-0" />
            Mes commandes
          </Link>
          <Link
            href="/amis"
            onClick={() => setOuvert(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-700 transition hover:bg-[#14213D]/5 hover:text-[#14213D] dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-100"
          >
            <IconeAmis className="h-4.5 w-4.5 shrink-0" />
            Mes amis
          </Link>

          <div className="my-3 border-t border-[#14213D]/10 dark:border-white/15" />

          <ThemeToggle
            variant="item"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-neutral-700 transition hover:bg-[#14213D]/5 hover:text-[#14213D] dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-100"
          />
        </nav>

        <div className="border-t border-[#14213D]/10 px-4 py-4 text-xs text-neutral-400 dark:border-white/15 dark:text-gray-400">
          Paiement à la livraison · Côte d&apos;Ivoire 🇨🇮
        </div>
      </aside>
    </>
  );

  return (
    <>
      <button
        onClick={() => setOuvert(true)}
        aria-label="Ouvrir le menu"
        className="shrink-0 text-[#E8C255] hover:text-white"
      >
        <IconeMenu className="h-5.5 w-5.5" />
      </button>
      {monte && createPortal(tiroir, document.body)}
    </>
  );
}
