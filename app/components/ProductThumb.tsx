// ============================================================
//  VIGNETTE PRODUIT OPTIMISÉE — utilise <Image> de Next.js
//  Optimise automatiquement : format moderne (WebP/AVIF),
//  bonne taille selon l'écran, chargement différé.
// ============================================================

import Image from "next/image";

export default function ProductThumb({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-xs text-neutral-400">
        photo à venir
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className="object-cover transition duration-500 group-hover:scale-105"
    />
  );
}
