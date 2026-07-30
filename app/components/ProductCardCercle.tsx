// ============================================================
//  CARTE PRODUIT CIRCULAIRE — pour les rangées "coup de cœur"
//  Vignette ronde + nom + prix, pensée pour un défilement horizontal.
// ============================================================

import Link from "next/link";
import ProductThumb from "./ProductThumb";

export default function ProductCardCercle({
  slug,
  name,
  price,
  imageUrl,
  imageAlt,
}: {
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  imageAlt?: string | null;
}) {
  return (
    <Link
      href={`/produits/${slug}`}
      className="group flex w-20 shrink-0 flex-col items-center gap-1.5 text-center sm:w-24"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-full border-2 border-[#14213D]/10 bg-[#FBEEDA] shadow-sm transition group-hover:border-[#F1720A]/40 group-hover:shadow-md">
        <ProductThumb src={imageUrl} alt={imageAlt ?? name} />
      </div>
      <p className="line-clamp-2 text-xs font-medium leading-snug text-[#14213D]">
        {name}
      </p>
      <p className="text-xs font-bold text-[#F1720A]">
        {new Intl.NumberFormat("fr-FR").format(price)} FCFA
      </p>
    </Link>
  );
}
