// ============================================================
//  GESTION DES TAILLES D'UN PRODUIT (admin) — Client Component
//  Ajouter/supprimer une taille (nom : "M", "42", "250ml"...) avec
//  ses propres photos (ex: rendu d'une contenance ou d'un format).
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSize, deleteSize } from "./actions";
import ProductImageUploader from "./ProductImageUploader";
import ProductImageList from "./ProductImageList";

type Img = { id: string; url: string; position: number };
type Taille = { id: string; name: string; images: Img[] };

export default function SizeManager({
  productId,
  sizes,
}: {
  productId: string;
  sizes: Taille[];
}) {
  const router = useRouter();
  const [nom, setNom] = useState("");
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
        await createSize(productId, nom);
        setNom("");
        router.refresh();
      } catch (err) {
        setErreur(err instanceof Error ? err.message : "Erreur lors de la création.");
      }
    });
  }

  function supprimer(sizeId: string) {
    const ok = window.confirm("Supprimer cette taille et ses photos ?");
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteSize(sizeId, productId);
      if (!res.ok) setErreur(res.error ?? "Erreur lors de la suppression.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {sizes.length === 0 && (
        <p className="text-sm text-neutral-400 dark:text-gray-400">
          Aucune taille — l&apos;article garde un prix/stock unique.
        </p>
      )}

      {sizes.map((s) => (
        <div
          key={s.id}
          className="rounded-lg border border-[#14213D]/10 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333]"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#14213D] dark:text-gray-300">{s.name}</span>
            <button
              type="button"
              disabled={pending}
              onClick={() => supprimer(s.id)}
              className="text-xs font-medium text-[#D6293E] hover:underline disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-start gap-2">
            <ProductImageList images={s.images} />
            <ProductImageUploader productId={productId} sizeId={s.id} />
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-dashed border-[#14213D]/20 p-3 dark:border-white/15">
        <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-gray-400">
          + Ajouter une taille
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="ex: M ou 42"
            className="rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
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
