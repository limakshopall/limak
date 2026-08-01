// ============================================================
//  LISTE DES IMAGES D'UN PRODUIT — Client Component
//  Affiche les images + un bouton pour en supprimer une.
// ============================================================

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductImage } from "./actions";

type Img = { id: string; url: string };

export default function ProductImageList({ images }: { images: Img[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (images.length === 0) {
    return <p className="text-sm text-neutral-400 dark:text-gray-400">Aucune image pour l'instant.</p>;
  }

  function handleDelete(imageId: string) {
    startTransition(async () => {
      await deleteProductImage(imageId);
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {images.map((img) => (
        <div key={img.id} className="group relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt=""
            className="aspect-square w-full rounded-lg object-cover"
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
    </div>
  );
}
