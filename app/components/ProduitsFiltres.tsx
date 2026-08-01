// ============================================================
//  FILTRES PRODUITS — Client Component
//  Barre de recherche + catégorie + tri. Met à jour l'URL,
//  ce qui recharge la liste côté serveur avec les bons filtres.
// ============================================================

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import ProductThumb from "./ProductThumb";

type Categorie = { slug: string; name: string; imageUrl?: string | null };

function IconeRecherche({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconeEffacer({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconeTri({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18M6 12h12M10 18h4" />
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

export default function ProduitsFiltres({
  categories,
}: {
  categories: Categorie[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [recherche, setRecherche] = useState(params.get("q") ?? "");
  const categorie = params.get("categorie") ?? "";
  const tri = params.get("tri") ?? "recent";

  // Met à jour un paramètre dans l'URL (et relance la page)
  function setParam(cle: string, valeur: string) {
    const p = new URLSearchParams(params.toString());
    if (valeur) p.set(cle, valeur);
    else p.delete(cle);
    router.push(`/produits?${p.toString()}`);
  }

  // Recherche : on attend que l'utilisateur arrête de taper (300 ms)
  useEffect(() => {
    const t = setTimeout(() => {
      const actuel = params.get("q") ?? "";
      if (recherche !== actuel) setParam("q", recherche);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche]);

  return (
    <div className="mb-8 rounded-2xl border border-[#E8C255]/30 bg-gradient-to-br from-[#182A4D] to-[#0F1B33] p-4 shadow-lg shadow-[#14213D]/25 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Recherche — doré brillant */}
        <div className="relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#FCE8A8] via-[#E8C255] to-[#C9962B] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_6px_rgba(0,0,0,0.25)] sm:max-w-sm">
          <IconeRecherche className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#14213D]/70" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un article…"
            className="w-full bg-transparent py-2.5 pl-10 pr-9 text-sm font-medium text-[#14213D] placeholder-[#14213D]/60 outline-none focus:ring-2 focus:ring-white/60"
          />
          {recherche && (
            <button
              type="button"
              onClick={() => setRecherche("")}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#14213D]/60 hover:text-[#14213D]"
            >
              <IconeEffacer className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tri — doré brillant */}
        <div className="relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#FCE8A8] via-[#E8C255] to-[#C9962B] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_6px_rgba(0,0,0,0.25)] sm:ml-auto sm:w-56">
          <IconeTri className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#14213D]/70" />
          <select
            value={tri}
            onChange={(e) => setParam("tri", e.target.value)}
            className="w-full appearance-none bg-transparent py-2.5 pl-10 pr-8 text-sm font-medium text-[#14213D] outline-none focus:ring-2 focus:ring-white/60"
          >
            <option value="recent">Nouveautés</option>
            <option value="prix-asc">Prix croissant</option>
            <option value="prix-desc">Prix décroissant</option>
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#14213D]/70">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Catégorie : pastilles rondes avec photo, défilement horizontal */}
      <div className="scrollbar-none mt-4 flex gap-3 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setParam("categorie", "")}
          className="flex shrink-0 flex-col items-center gap-1.5"
        >
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition ${
              categorie === ""
                ? "border-[#FCE8A8] bg-gradient-to-br from-[#FCE8A8] via-[#E8C255] to-[#C9962B] text-[#14213D] shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                : "border-white/15 bg-white/5 text-white/50 hover:border-white/30"
            }`}
          >
            <IconeTout className="h-6 w-6" />
          </span>
          <span className={`text-xs font-medium ${categorie === "" ? "font-bold text-[#E8C255]" : "text-white/60"}`}>
            Tout
          </span>
        </button>

        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setParam("categorie", c.slug)}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <span
              className={`relative h-14 w-14 overflow-hidden rounded-full border-2 transition ${
                categorie === c.slug
                  ? "border-[#FCE8A8] ring-2 ring-[#E8C255]/50"
                  : "border-white/15 hover:border-white/30"
              }`}
            >
              <ProductThumb src={c.imageUrl ?? null} alt={c.name} />
            </span>
            <span
              className={`max-w-[4.5rem] truncate text-xs ${
                categorie === c.slug ? "font-bold text-[#E8C255]" : "font-medium text-white/60"
              }`}
            >
              {c.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
