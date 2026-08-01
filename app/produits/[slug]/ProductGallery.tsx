// ============================================================
//  GALERIE PRODUIT — Client Component (interactif)
//  Images optimisées avec next/image.
// ============================================================

"use client";

import { useState } from "react";
import Image from "next/image";
import ProductPhoto from "../../components/ProductPhoto";

type Img = { id: string; url: string; alt: string | null; width?: number | null; height?: number | null };

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
      {/* Grande image — pas de cadre forcé : suit la vraie forme de la photo */}
      <div className="overflow-hidden rounded-xl border-2 border-[#C9A84C] bg-white dark:bg-[#1c2333]">
        <ProductPhoto
          src={images[active].url}
          alt={images[active].alt ?? name}
          width={images[active].width}
          height={images[active].height}
          quality={95}
          sizes="(max-width: 768px) 100vw, 500px"
          priority
        />
      </div>

      {/* Miniatures cliquables */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded border-2 bg-white dark:bg-[#1c2333] ${
                i === active ? "border-[#F1720A]" : "border-[#C9A84C]/70"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? name}
                fill
                quality={90}
                sizes="120px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}