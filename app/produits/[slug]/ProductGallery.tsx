// ============================================================
//  GALERIE PRODUIT — Client Component (interactif)
//  Images optimisées avec next/image.
// ============================================================

"use client";

import { useState } from "react";
import Image from "next/image";

type Img = { id: string; url: string; alt: string | null };

export default function ProductGallery({
  images,
  name,
}: {
  images: Img[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-[#FBEEDA] text-neutral-400 dark:bg-[#1c2333] dark:text-gray-400">
        photo à venir
      </div>
    );
  }

  return (
    <div>
      {/* Grande image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#FBEEDA] dark:bg-[#1c2333]">
        <Image
          src={images[active].url}
          alt={images[active].alt ?? name}
          fill
          sizes="(max-width: 768px) 100vw, 500px"
          priority
          className="object-cover"
        />
      </div>

      {/* Miniatures cliquables */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded border-2 ${
                i === active ? "border-[#F1720A]" : "border-transparent"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? name}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}