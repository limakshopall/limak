// ============================================================
//  PHOTO PRODUIT — respecte la forme réelle de l'image (carrée,
//  rectangle vertical ou horizontal) au lieu de la recadrer dans
//  un cadre fixe. Utilise les dimensions stockées en base ; à
//  défaut (anciennes photos), repli en carré.
// ============================================================

import Image from "next/image";

const REPLI = { width: 800, height: 800 };

export default function ProductPhoto({
  src,
  alt,
  width,
  height,
  className = "",
  sizes,
  priority = false,
  quality = 90,
}: {
  src: string | null;
  alt: string;
  width?: number | null;
  height?: number | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}) {
  if (!src) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-neutral-100 text-xs text-neutral-400 dark:bg-white/5 dark:text-gray-400">
        photo à venir
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? REPLI.width}
      height={height ?? REPLI.height}
      quality={quality}
      priority={priority}
      sizes={sizes}
      className={`h-auto w-full ${className}`}
    />
  );
}
