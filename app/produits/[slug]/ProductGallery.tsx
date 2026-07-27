// ============================================================
//  GALERIE PRODUIT — Client Component (interactif)
//  Le "use client" ci-dessous autorise les clics / l'état local.
// ============================================================

"use client";

import { useState } from "react";

// Le type des images qu'on reçoit (id, url, texte alternatif).
type Img = { id: string; url: string; alt: string | null };

export default function ProductGallery({
  images,
  name,
}: {
  images: Img[];
  name: string;
}) {
  // "active" = l'index de l'image actuellement affichée en grand.
  // useState crée une petite mémoire qui déclenche un ré-affichage
  // à chaque changement (le cœur de l'interactivité React).
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
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active].url}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Miniatures cliquables */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`aspect-square overflow-hidden rounded border-2 ${
                i === active ? "border-black" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? name}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
