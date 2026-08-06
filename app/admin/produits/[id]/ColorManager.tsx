// ============================================================
//  GESTION DES COULEURS D'UN PRODUIT (admin) — Client Component
//  Ajouter/supprimer une couleur (nom + hex facultatif), avec ses
//  propres photos (upload rattaché à cette couleur).
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createColor, deleteColor } from "./actions";
import ProductImageUploader from "./ProductImageUploader";
import ProductImageList from "./ProductImageList";

type Img = { id: string; url: string; position: number };
type Couleur = { id: string; name: string; hex: string | null; images: Img[] };

export default function ColorManager({
  productId,
  colors,
}: {
  productId: string;
  colors: Couleur[];
}) {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [hex, setHex] = useState("#D6293E");
  const [erreur, setErreur] = useState("");
  const [pending, startTransition] = useTransition();

  function ajouter() {
    if (!nom.trim()) {
      setErreur("Le nom est requis.");
      return;
    }
    setErreur("");
    startTransition(async () => {
      try {
        await createColor(productId, nom, hex);
        setNom("");
        router.refresh();
      } catch (err) {
        setErreur(err instanceof Error ? err.message : "Erreur lors de la création.");
      }
    });
  }

  function supprimer(colorId: string) {
    const ok = window.confirm("Supprimer cette couleur et ses photos ?");
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteColor(colorId, productId);
      if (!res.ok) setErreur(res.error ?? "Erreur lors de la suppression.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {colors.length === 0 && (
        <p className="text-sm text-neutral-400 dark:text-gray-400">
          Aucune couleur — l&apos;article garde un prix/stock unique.
        </p>
      )}

      {colors.map((c) => (
        <div
          key={c.id}
          className="rounded-lg border border-[#14213D]/10 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-5 w-5 shrink-0 rounded-full border border-[#14213D]/20"
                style={{ backgroundColor: c.hex ?? "#cccccc" }}
              />
              <span className="font-medium text-[#14213D] dark:text-gray-300">{c.name}</span>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => supprimer(c.id)}
              className="text-xs font-medium text-[#D6293E] hover:underline disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-start gap-2">
            <ProductImageList productId={productId} images={c.images} />
            <ProductImageUploader productId={productId} colorId={c.id} />
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-dashed border-[#14213D]/20 p-3 dark:border-white/15">
        <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-gray-400">
          + Ajouter une couleur
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="ex: Rouge"
            className="rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
          />
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border border-[#14213D]/15 dark:border-white/15"
            aria-label="Couleur d'affichage (facultatif)"
          />
          <button
            type="button"
            disabled={pending}
            onClick={ajouter}
            className="rounded-full bg-[#F1720A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#C95900] disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
        {erreur && <p className="mt-2 text-xs font-medium text-[#D6293E]">{erreur}</p>}
      </div>
    </div>
  );
}
