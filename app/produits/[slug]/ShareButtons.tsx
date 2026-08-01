// ============================================================
//  BOUTONS DE PARTAGE — Client Component
//  Sur mobile : ouvre le menu de partage du téléphone (WhatsApp,
//  Facebook, SMS, Gmail…). Sinon : WhatsApp + copier le lien.
// ============================================================

"use client";

import { useState } from "react";

export default function ShareButtons({
  slug,
  name,
  price,
}: {
  slug: string;
  name: string;
  price: number;
}) {
  const [copie, setCopie] = useState(false);

  function getUrl() {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/produits/${slug}`;
    }
    return "";
  }

  const prixTxt = new Intl.NumberFormat("fr-FR").format(price);
  const texte = `Regarde cet article sur LIMAK : ${name} à ${prixTxt} FCFA`;

  // Menu de partage natif du téléphone (WhatsApp, Facebook, SMS, Gmail…)
  async function partager() {
    const url = getUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: name, text: texte, url });
      } catch {
        // l'utilisateur a annulé le partage : on ne fait rien
      }
    } else {
      // Ordinateur sans menu natif : on bascule sur WhatsApp
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${texte} — ${url}`)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  async function copierLien() {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // si la copie échoue, on ne fait rien de grave
    }
  }

  return (
    <div className="mt-6 flex items-center gap-3">
      <span className="text-sm text-gray-500 dark:text-gray-400">Partager :</span>

      {/* Bouton principal : menu natif (mobile) ou WhatsApp (ordi) */}
      <button
        onClick={partager}
        className="flex items-center gap-1.5 rounded-full bg-[#14213D] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#26365c]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Partager
      </button>

      {/* Copier le lien (toujours dispo) */}
      <button
        onClick={copierLien}
        className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/5"
      >
        {copie ? "Lien copié ✓" : "Copier le lien"}
      </button>
    </div>
  );
}