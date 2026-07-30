// ============================================================
//  FILTRES ADMIN PRODUITS — Client Component
//  Barre de recherche + tri. Met à jour l'URL (?q=&tri=).
// ============================================================

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminProduitsFiltres() {
  const router = useRouter();
  const params = useSearchParams();

  const [recherche, setRecherche] = useState(params.get("q") ?? "");
  const tri = params.get("tri") ?? "nom";

  function setParam(cle: string, valeur: string) {
    const p = new URLSearchParams(params.toString());
    if (valeur) p.set(cle, valeur);
    else p.delete(cle);
    router.push(`/admin/produits?${p.toString()}`);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      const actuel = params.get("q") ?? "";
      if (recherche !== actuel) setParam("q", recherche);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche]);

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher un produit…"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:max-w-xs"
      />

      <select
        value={tri}
        onChange={(e) => setParam("tri", e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="nom">Nom (A-Z)</option>
        <option value="stock-asc">Stock (croissant)</option>
        <option value="prix-asc">Prix croissant</option>
        <option value="prix-desc">Prix décroissant</option>
      </select>
    </div>
  );
}
