// ============================================================
//  CARTE PRODUIT réutilisable (accueil + catalogue)
//  Image (+ 2e photo au survol) + nom + prix (+ promo) + note
//  + badges "Nouveau" / "Épuisé" + variante "premium" (cadre doré animé).
// ============================================================

import Link from "next/link";
import Image from "next/image";
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
  imageUrlHover,
  note,
  stock,
  isNew = false,
  premium = false,
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
  imageUrlHover?: string | null;
  note?: Note;
  stock?: number;
  isNew?: boolean;
  premium?: boolean;
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
      className={`group relative block overflow-hidden rounded-2xl border-2 border-[#E8C255] bg-[#FFFBF3] p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-[#05070d] ${
        premium ? "border-[3px]" : ""
      } ${epuise ? "opacity-60" : ""}`}
    >
      {/* Cadre doré animé (lumière qui se déplace) réservé aux produits "Premium Spotlight" */}
      {premium && (
        <span
          aria-hidden
          className="limak-shimmer pointer-events-none absolute inset-0 rounded-2xl"
        />
      )}

      {/* L'image "flotte" sur son propre coussin (fond + ombre) pour ne pas se fondre dans la carte.
          Pas de cadre forcé : la hauteur suit la vraie forme de la photo (carrée, portrait, paysage). */}
      <div className="relative overflow-hidden rounded-xl border-2 border-[#E8C255] bg-white shadow-[0_6px_14px_-6px_rgba(20,33,61,0.28)] dark:bg-[#1c2333]">
        <ProductPhoto
          src={imageUrl}
          alt={imageAlt ?? name}
          width={imageWidth}
          height={imageHeight}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* 2e photo : apparaît en fondu au survol (souris), par-dessus la première */}
        {imageUrlHover && (
          <div className="absolute inset-0 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
            <Image
              src={imageUrlHover}
              alt=""
              fill
              className="object-contain"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        )}

        {/* Badge en haut à droite : promo, sinon "Nouveau" — un seul à la fois pour rester lisible */}
        {enPromo && !epuise && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-[#D6293E] px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{reduction}%
          </span>
        )}
        {!enPromo && isNew && !epuise && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-[#E8C255] px-1.5 py-0.5 text-[10px] font-bold text-[#14213D]">
            Nouveau
          </span>
        )}

        {/* Badge en haut à gauche : premium, sinon épuisé */}
        {premium && !epuise && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-[#14213D] px-2 py-0.5 text-[10px] font-semibold text-[#E8C255]">
            ⭐ Sélection LIMAK
          </span>
        )}
        {epuise && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-neutral-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
            Épuisé
          </span>
        )}
      </div>
      <div className="p-1.5 pt-2">
        <h3
          className={`line-clamp-2 min-h-[2.2em] font-semibold leading-tight text-[#14213D] dark:text-gray-300 ${
            premium ? "text-base sm:text-lg" : "text-sm sm:text-base"
          }`}
        >
          {name}
        </h3>

        {/* Prix (avec ancien prix barré si promo) */}
        <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
          <p className={`font-extrabold text-[#B9862B] dark:text-[#D9BC72] ${premium ? "text-lg sm:text-xl" : "text-base sm:text-lg"}`}>
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

        {/* "Ajouter au panier" — visible seulement au survol (desktop), pour ne pas gêner sur mobile */}
        {!epuise && (
          <span className="mt-2 hidden w-full items-center justify-center rounded-full bg-[#F1720A] py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:flex">
            Voir l&apos;article
          </span>
        )}
      </div>
    </Link>
  );
}
