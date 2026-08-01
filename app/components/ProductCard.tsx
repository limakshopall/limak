// ============================================================
//  CARTE PRODUIT réutilisable (accueil + catalogue)
//  Image + nom + prix (+ promo) + note + badge "Épuisé".
// ============================================================

import Link from "next/link";
import ProductPhoto from "./ProductPhoto";

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
// Au-delà, une "promo" ressemble plus à une erreur de saisie qu'à une vraie remise
// (ex: prix barré tapé avec un zéro en trop) — on ne l'affiche pas.
const REDUCTION_MAX_CREDIBLE = 60;

type Note = { moyenne: number; nb: number };

export default function ProductCard({
  slug,
  colorId,
  name,
  price,
  comparePrice,
  imageUrl,
  imageAlt,
  imageWidth,
  imageHeight,
  note,
  stock,
  large = false,
}: {
  slug: string;
  colorId?: string | null;
  name: string;
  price: number;
  comparePrice?: number | null;
  imageUrl: string | null;
  imageAlt?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  note?: Note;
  stock?: number;
  large?: boolean;
}) {
  const epuise = stock !== undefined && stock <= 0;
  // En promo si comparePrice existe, est plus élevé que le prix actuel,
  // et donne une réduction crédible (sinon probable erreur de saisie).
  const reductionBrute =
    comparePrice != null && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;
  const enPromo = reductionBrute > 0 && reductionBrute <= REDUCTION_MAX_CREDIBLE;
  const reduction = enPromo ? reductionBrute : 0;
  // Urgence : affiché seulement quand le stock est réellement bas, pour garder le signal fort.
  const stockBas = stock !== undefined && stock > 0 && stock <= SEUIL_STOCK_BAS;

  return (
    <Link
      href={colorId ? `/produits/${slug}?couleur=${colorId}` : `/produits/${slug}`}
      className={`group block overflow-hidden rounded-2xl border border-[#14213D]/10 bg-[#FFFBF3] p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/15 dark:bg-[#05070d] ${
        epuise ? "opacity-60" : ""
      }`}
    >
      {/* L'image "flotte" sur son propre coussin (fond + ombre) pour ne pas se fondre dans la carte.
          Pas de cadre forcé : la hauteur suit la vraie forme de la photo (carrée, portrait, paysage). */}
      <div className="relative overflow-hidden rounded-xl bg-white shadow-[0_6px_14px_-6px_rgba(20,33,61,0.28)] dark:bg-[#1c2333]">
        <ProductPhoto
          src={imageUrl}
          alt={imageAlt ?? name}
          width={imageWidth}
          height={imageHeight}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badge promo (en haut à droite) */}
        {enPromo && !epuise && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-[#D6293E] px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{reduction}%
          </span>
        )}

        {/* Badge "Épuisé" (en haut à gauche) — discret, ne crie pas plus fort qu'une promo */}
        {epuise && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-neutral-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
            Épuisé
          </span>
        )}
      </div>
      <div className="p-1.5 pt-2">
        <h3 className="line-clamp-2 min-h-[2.2em] text-sm font-semibold leading-tight text-[#14213D] dark:text-gray-300 sm:text-base">
          {name}
        </h3>

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