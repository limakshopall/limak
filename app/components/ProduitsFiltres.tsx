// ============================================================
//  FILTRES PRODUITS — Client Component
//  Barre de recherche + catégorie + tri. Met à jour l'URL,
//  ce qui recharge la liste côté serveur avec les bons filtres.
// ============================================================

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type Categorie = { slug: string; name: string };

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
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Recherche */}
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un produit…"
          className="w-full rounded-lg border border-[#14213D]/15 bg-[#FFFBF3] px-4 py-2 sm:max-w-xs"
        />

        {/* Tri */}
        <select
          value={tri}
          onChange={(e) => setParam("tri", e.target.value)}
          className="rounded-lg border border-[#14213D]/15 bg-[#FFFBF3] px-3 py-2"
        >
          <option value="recent">Nouveautés</option>
          <option value="prix-asc">Prix croissant</option>
          <option value="prix-desc">Prix décroissant</option>
        </select>
      </div>

      {/* Catégorie : boutons cliquables plutôt qu'un menu déroulant */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setParam("categorie", "")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            categorie === ""
              ? "bg-[#14213D] text-[#FBEEDA]"
              : "border border-[#14213D]/15 bg-[#FFFBF3] text-[#14213D] hover:bg-[#14213D]/5"
          }`}
        >
          Tout
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setParam("categorie", c.slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              categorie === c.slug
                ? "bg-[#14213D] text-[#FBEEDA]"
                : "border border-[#14213D]/15 bg-[#FFFBF3] text-[#14213D] hover:bg-[#14213D]/5"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
