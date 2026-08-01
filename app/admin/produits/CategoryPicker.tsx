// ============================================================
//  SÉLECTEUR DE CATÉGORIE (admin) — Client Component
//  Choix parmi les catégories existantes + création à la volée
//  (nom + image) sans quitter le formulaire produit.
// ============================================================

"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { UploadButton } from "../../lib/uploadthing";
import { createCategory } from "./categoryActions";

type Categorie = { id: string; name: string; imageUrl: string | null };

export default function CategoryPicker({
  categories: categoriesInitiales,
  defaultValue = "",
}: {
  categories: Categorie[];
  defaultValue?: string;
}) {
  const [categories, setCategories] = useState(categoriesInitiales);
  const [selection, setSelection] = useState(defaultValue);
  const [ouvert, setOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [erreur, setErreur] = useState("");
  const [pending, startTransition] = useTransition();

  function creerCategorie() {
    if (!nom.trim()) {
      setErreur("Le nom est requis.");
      return;
    }
    setErreur("");
    startTransition(async () => {
      try {
        const categorie = await createCategory(nom, imageUrl);
        setCategories((prev) => [...prev, categorie].sort((a, b) => a.name.localeCompare(b.name)));
        setSelection(categorie.id);
        setOuvert(false);
        setNom("");
        setImageUrl(null);
      } catch (err) {
        setErreur(err instanceof Error ? err.message : "Erreur lors de la création.");
      }
    });
  }

  return (
    <div>
      <label className="block text-sm text-neutral-600 dark:text-gray-400">Catégorie</label>
      <div className="mt-1 flex gap-2">
        <select
          name="categoryId"
          value={selection}
          onChange={(e) => setSelection(e.target.value)}
          className="w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#C9962B] focus:ring-1 focus:ring-[#C9962B] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
        >
          <option value="">— Aucune —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setOuvert((o) => !o)}
          className="shrink-0 rounded-lg border border-[#14213D]/15 px-3 py-2 text-sm font-medium text-[#14213D] hover:bg-[#14213D]/5 dark:border-white/15 dark:text-gray-300"
        >
          {ouvert ? "Annuler" : "+ Nouvelle"}
        </button>
      </div>

      {ouvert && (
        <div className="mt-3 space-y-3 rounded-lg border border-dashed border-[#14213D]/20 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333]">
          <div>
            <label className="block text-xs text-neutral-500 dark:text-gray-400">Nom de la catégorie</label>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex: Chaussures"
              className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#C9962B] focus:ring-1 focus:ring-[#C9962B] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
            />
          </div>

          <div className="flex items-center gap-3">
            {imageUrl ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#14213D]/15">
                <Image src={imageUrl} alt="" fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-dashed border-[#14213D]/20 text-[10px] text-neutral-400 dark:border-white/15 dark:text-gray-400">
                photo
              </div>
            )}
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                const url = res?.[0]?.ufsUrl;
                if (url) setImageUrl(url);
              }}
              onUploadError={(err: Error) => setErreur(`Erreur d'image : ${err.message}`)}
            />
          </div>

          {erreur && <p className="text-xs font-medium text-[#D6293E]">{erreur}</p>}

          <button
            type="button"
            disabled={pending}
            onClick={creerCategorie}
            className="rounded-full bg-[#14213D] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#14213D]/85 disabled:opacity-50"
          >
            {pending ? "Création…" : "Créer la catégorie"}
          </button>
        </div>
      )}
    </div>
  );
}
