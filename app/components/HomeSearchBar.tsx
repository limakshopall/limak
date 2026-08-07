// ============================================================
//  BARRE DE RECHERCHE — page d'accueil
//  Redirige vers /produits?q=... (même paramètre que le catalogue).
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearchBar() {
  const router = useRouter();
  const [valeur, setValeur] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = valeur.trim();
    router.push(q ? `/produits?q=${encodeURIComponent(q)}` : "/produits");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl items-center gap-2">
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          value={valeur}
          onChange={(e) => setValeur(e.target.value)}
          placeholder="Rechercher un produit… (ex : chaussures, montre)"
          className="w-full rounded-full border border-[#14213D]/15 bg-[#FFFBF3] py-3 pl-11 pr-4 text-sm text-[#14213D] shadow-sm outline-none transition focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-200"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-full bg-[#14213D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c2d54]"
      >
        Chercher
      </button>
    </form>
  );
}
