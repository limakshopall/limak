// ============================================================
//  FILTRES DES COMMANDES (admin) — Client Component
//  Recherche (nom / téléphone) + filtre par statut, via l'URL.
// ============================================================

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const STATUTS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default function CommandesFiltres() {
  const router = useRouter();
  const params = useSearchParams();

  const [recherche, setRecherche] = useState(params.get("q") ?? "");
  const statut = params.get("statut") ?? "";

  function setParam(cle: string, valeur: string) {
    const p = new URLSearchParams(params.toString());
    if (valeur) p.set(cle, valeur);
    else p.delete(cle);
    router.push(`/admin/commandes?${p.toString()}`);
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
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher (nom ou téléphone)…"
        className="w-full rounded-lg border border-[#14213D]/15 px-4 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] sm:max-w-xs"
      />

      <select
        value={statut}
        onChange={(e) => setParam("statut", e.target.value)}
        className="rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
      >
        <option value="">Tous les statuts</option>
        {Object.entries(STATUTS).map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}