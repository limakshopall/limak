// ============================================================
//  UNSPLASH PICKER — recherche + sélection d'une image Unsplash
//  Réutilisable partout dans l'admin (catégories, produits...).
//  Appelle /api/admin/chercher-images (auth cookie limak_admin).
// ============================================================

"use client";

import { useState } from "react";

type ImageUnsplash = {
  id: string;
  urlThumb: string;
  urlFull: string;
  urlTelechargement: string;
  auteurNom: string;
  auteurProfil: string;
};

export default function UnsplashPicker({
  onChoisir,
  placeholder = "ex : chaussures",
}: {
  onChoisir: (url: string, credit: { nom: string; profil: string }) => void;
  placeholder?: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [requete, setRequete] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [resultats, setResultats] = useState<ImageUnsplash[]>([]);

  async function handleChercher() {
    if (!requete.trim()) {
      setErreur("Tape un mot-clé avant de chercher.");
      return;
    }
    setChargement(true);
    setErreur("");
    try {
      const res = await fetch(`/api/admin/chercher-images?q=${encodeURIComponent(requete)}`);
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.erreur ?? "La recherche a échoué.");
        return;
      }
      setResultats(data.images);
    } catch {
      setErreur("La recherche a échoué. Vérifie ta connexion.");
    } finally {
      setChargement(false);
    }
  }

  function handleChoisir(img: ImageUnsplash) {
    onChoisir(img.urlFull, { nom: img.auteurNom, profil: img.auteurProfil });
    fetch("/api/admin/chercher-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urlTelechargement: img.urlTelechargement }),
    }).catch(() => {});
    setOuvert(false);
    setResultats([]);
    setRequete("");
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="text-xs font-semibold text-[#F1720A] hover:underline"
      >
        Chercher sur Unsplash
      </button>
    );
  }

  return (
    <div className="mt-2 w-full max-w-sm rounded-lg border border-[#14213D]/10 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-gray-400">
          Chercher sur Unsplash
        </p>
        <button type="button" onClick={() => setOuvert(false)} className="text-xs text-neutral-400 hover:text-[#14213D]">
          Fermer ✕
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={requete}
          onChange={(e) => setRequete(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleChercher()}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
        />
        <button
          type="button"
          onClick={handleChercher}
          disabled={chargement}
          className="shrink-0 rounded-lg bg-[#14213D] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1c2d54] disabled:opacity-50"
        >
          {chargement ? "..." : "Chercher"}
        </button>
      </div>
      {erreur && <p className="mt-2 text-xs text-[#D6293E]">{erreur}</p>}
      {resultats.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {resultats.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => handleChoisir(img)}
              title={`Photo par ${img.auteurNom}`}
              className="aspect-square overflow-hidden rounded-md border border-[#14213D]/10 transition hover:ring-2 hover:ring-[#F1720A]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.urlThumb} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
