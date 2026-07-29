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
      <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100 text-gray-400">
        photo à venir
      </div>
    );
  }

  return (
    <div>
      {/* Grande image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
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
                i === active ? "border-black" : "border-transparent"
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