// ============================================================
//  BANNIÈRE PUBLICITAIRE PLEINE LARGEUR — réutilisable (4 sur l'accueil)
//  Une image de fond + un habillage de couleur, cliquable vers une catégorie.
// ============================================================

import Link from "next/link";
import Image from "next/image";

type Variant = "navy" | "gold-navy" | "luxe";

const FONDS: Record<Variant, string> = {
  navy: "bg-[#14213D]",
  "gold-navy": "bg-gradient-to-br from-[#E8C255] via-[#8a7333] to-[#14213D]",
  luxe: "bg-gradient-to-b from-black via-[#0a0f1c] to-[#14213D]",
};

export default function PromoBanner({
  href,
  title,
  subtitle,
  imageUrl,
  variant = "navy",
  cta = "Découvrir",
}: {
  href: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  variant?: Variant;
  cta?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative block h-56 w-full overflow-hidden border-y-4 border-[#E8C255] sm:h-72 ${FONDS[variant]}`}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <div className="relative flex h-full flex-col items-start justify-end gap-2 px-6 pb-8 sm:items-center sm:justify-center sm:px-4 sm:text-center">
        <h2 className="max-w-xl text-2xl font-extrabold text-[#E8C255] drop-shadow sm:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="max-w-md text-sm text-white/85 sm:text-base">{subtitle}</p>
        )}
        <span className="mt-2 inline-block w-fit rounded-full bg-[#F1720A] px-6 py-2 text-sm font-semibold text-white transition group-hover:bg-[#C95900]">
          {cta} →
        </span>
      </div>
    </Link>
  );
}
