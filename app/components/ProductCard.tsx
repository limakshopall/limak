// ============================================================
//  CARTE PRODUIT réutilisable (accueil + catalogue)
//  Image + nom + prix (+ promo) + note + badge "Épuisé".
// ============================================================

import Link from "next/link";
import ProductThumb from "./ProductThumb";

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="leading-none">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? "text-[#C95900]" : "text-neutral-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

// Seuil en dessous duquel on affiche un message d'urgence (même seuil que l'admin).
const SEUIL_STOCK_BAS = 3;

type Note = { moyenne: number; nb: number };

export default function ProductCard({
  slug,
  name,
  price,
  comparePrice,
  imageUrl,
  imageAlt,
  note,
  stock,
  large = false,
}: {
  slug: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  imageUrl: string | null;
  imageAlt?: string | null;
  note?: Note;
  stock?: number;
  large?: boolean;
}) {
  const epuise = stock !== undefined && stock <= 0;
  // En promo si comparePrice existe ET est plus élevé que le prix actuel.
  const enPromo = comparePrice != null && comparePrice > price;
  const reduction = enPromo
    ? Math.round(((comparePrice! - price) / comparePrice!) * 100)
    : 0;
  // Urgence : affiché seulement quand le stock est réellement bas, pour garder le signal fort.
  const stockBas = stock !== undefined && stock > 0 && stock <= SEUIL_STOCK_BAS;

  return (
    <Link
      href={`/produits/${slug}`}
      className="group block overflow-hidden rounded-2xl border border-[#14213D]/10 bg-[#FFFBF3] p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/15 dark:bg-[#05070d]"
    >
      {/* L'image "flotte" sur son propre coussin (fond + ombre) pour ne pas se fondre dans la carte. */}
      <div
        className={`relative overflow-hidden rounded-xl bg-white shadow-[0_6px_14px_-6px_rgba(20,33,61,0.28)] dark:bg-[#1c2333] ${
          large ? "aspect-[4/3]" : "aspect-square"
        }`}
      >
        <div className={epuise ? "opacity-40" : ""}>
          <ProductThumb src={imageUrl} alt={imageAlt ?? name} />
        </div>

        {/* Badge promo (en haut à droite) */}
        {enPromo && !epuise && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-[#D6293E] px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{reduction}%
          </span>
        )}

        {/* Badge "Épuisé" (en haut à gauche) */}
        {epuise && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-neutral-700 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Épuisé
          </span>
        )}
      </div>
      <div className="p-1.5 pt-2">
        <h3 className="truncate text-sm font-semibold text-[#14213D] dark:text-gray-300 sm:text-base">{name}</h3>

        {/* Prix (avec ancien prix barré si promo) */}
        <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
          <p className="text-base font-extrabold text-[#B9862B] sm:text-lg">
            {new Intl.NumberFormat("fr-FR").format(price)} FCFA
          </p>
          {enPromo && (
            <p className="text-[10px] text-neutral-400 line-through dark:text-gray-400">
              {new Intl.NumberFormat("fr-FR").format(comparePrice!)} FCFA
            </p>
          )}
        </div>

        {note && note.nb > 0 && (
          <div className="mt-0.5 flex items-center gap-1 text-[10px]">
            <Stars value={note.moyenne} />
            <span className="text-neutral-500 dark:text-gray-400">({note.nb})</span>
          </div>
        )}

        {stockBas && (
          <p className="mt-0.5 text-[10px] font-semibold text-[#D6293E]">
            Plus que {stock} en stock
          </p>
        )}
      </div>
    </Link>
  );
}