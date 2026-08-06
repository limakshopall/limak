// ============================================================
//  LISTE DES IMAGES D'UN PRODUIT — Client Component
//  Glisser-déposer une vignette sur une autre pour les échanger —
//  les numéros (1 = photo principale) se réajustent automatiquement.
//  Bouton pour supprimer une photo.
// ============================================================

"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductImage, reorderProductImages } from "./actions";

type Img = { id: string; url: string; position: number };

export default function ProductImageList({
  productId,
  images,
}: {
  productId: string;
  images: Img[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragFrom = useRef<number | null>(null);

  if (images.length === 0) {
    return null;
  }

  function handleDelete(imageId: string) {
    startTransition(async () => {
      await deleteProductImage(imageId);
      router.refresh();
    });
  }

  function handleDrop(indexCible: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    setDragIndex(null);
    if (from === null || from === indexCible) return;

    const reordonnees = [...images];
    const [deplacee] = reordonnees.splice(from, 1);
    reordonnees.splice(indexCible, 0, deplacee);

    startTransition(async () => {
      await reorderProductImages(
        productId,
        reordonnees.map((img) => img.id)
      );
      router.refresh();
    });
  }

  return (
    <>
      {images.map((img, i) => (
        <div
          key={img.id}
          draggable
          onDragStart={() => {
            dragFrom.current = i;
            setDragIndex(i);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(i)}
          onDragEnd={() => {
            dragFrom.current = null;
            setDragIndex(null);
          }}
          className={`group relative h-20 w-20 shrink-0 cursor-move transition ${
            dragIndex === i ? "opacity-40" : ""
          } ${isPending ? "pointer-events-none opacity-70" : ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt=""
            draggable={false}
            className="h-full w-full rounded-lg object-cover"
          />
          <span
            title="Position (1 = photo principale) — glisse la photo pour changer l'ordre"
            className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#F1720A] text-xs font-bold text-white shadow"
          >
            {i + 1}
          </span>
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
