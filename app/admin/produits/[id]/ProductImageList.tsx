// ============================================================
//  LISTE DES IMAGES D'UN PRODUIT — Client Component
//  Affiche les images + un numéro d'ordre modifiable (1 = photo
//  principale, affichée en premier) + un bouton pour en supprimer une.
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductImage, updateImagePosition } from "./actions";

type Img = { id: string; url: string; position: number };

export default function ProductImageList({ images }: { images: Img[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Numéros affichés localement (1-indexés) pendant la saisie, avant l'enregistrement.
  const [numeros, setNumeros] = useState<Record<string, string>>(() =>
    Object.fromEntries(images.map((img) => [img.id, String(img.position + 1)]))
  );

  if (images.length === 0) {
    return null;
  }

  function handleDelete(imageId: string) {
    startTransition(async () => {
      await deleteProductImage(imageId);
      router.refresh();
    });
  }

  function handleNumeroChange(imageId: string, valeur: string) {
    setNumeros((prev) => ({ ...prev, [imageId]: valeur }));
  }

  function handleNumeroValider(imageId: string) {
    const n = parseInt(numeros[imageId], 10);
    if (!Number.isFinite(n) || n < 1) return;
    startTransition(async () => {
      await updateImagePosition(imageId, n);
      router.refresh();
    });
  }

  return (
    <>
      {images.map((img) => (
        <div key={img.id} className="group relative h-20 w-20 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt=""
            className="h-full w-full rounded-lg object-cover"
          />
          <input
            type="number"
            min={1}
            value={numeros[img.id] ?? ""}
            onChange={(e) => handleNumeroChange(img.id, e.target.value)}
            onBlur={() => handleNumeroValider(img.id)}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            disabled={isPending}
            title="Numéro d'affichage (1 = photo principale)"
            className="absolute left-1 top-1 h-6 w-6 rounded-full border-2 border-white bg-[#F1720A] p-0 text-center text-xs font-bold text-white shadow outline-none focus:bg-[#C95900] disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() => handleDelete(img.id)}
            disabled={isPending}
            className="absolute right-1 top-1 rounded bg-[#14213D]/70 px-1.5 text-xs text-white hover:bg-[#D6293E] disabled:opacity-50"
            aria-label="Supprimer l'image"
          >
            ✕
          </button>
        </div>
      ))}
    </>
  );
}
