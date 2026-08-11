// ============================================================
//  CARTE PRODUIT réutilisable (accueil + catalogue)
//  Image (+ 2e photo au survol) + nom + prix (+ promo) + note
//  + badges "Nouveau" / "Épuisé" + variante "premium" (cadre doré animé).
// ============================================================

import Link from "next/link";
import Image from "next/image";
import { useId } from "react";
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

// Dégradé du badge "feu" : à t=0 (petite réduction) un ton doux orange/or, qui
// vire de plus en plus vers le rouge à mesure que t approche 1 (réduction
// max crédible) — pas de noir, juste une chaleur croissante.
function hexVersRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function teinteFeu(t: number, [c0, c1]: [string, string]): string {
  const tc = Math.max(0, Math.min(t, 1));
  const [r1, g1, b1] = hexVersRgb(c0);
  const [r2, g2, b2] = hexVersRgb(c1);
  const r = r1 + (r2 - r1) * tc;
  const g = g1 + (g2 - g1) * tc;
  const b = b1 + (b2 - b1) * tc;
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
const BORD_FEU: [string, string] = ["#F1720A", "#D6293E"]; // mangue -> hibiscus (rouge)
const CENTRE_FEU: [string, string] = ["#FFD98A", "#F1720A"]; // or pâle -> mangue

// Petites flammes visibles au-dessus du badge : plus `intensite` (0 à 1) est
// élevée, plus elles sont grandes et débordent des dimensions du badge.
function FlammesBadge({ intensite }: { intensite: number }) {
  const id = useId();
  const t = Math.max(0, Math.min(intensite, 1));
  const bordCouleur = teinteFeu(t, BORD_FEU);
  const centreCouleur = teinteFeu(t, CENTRE_FEU);
  const positions = [
    { gauche: "18%", echelle: 0.8, delai: "0s" },
    { gauche: "50%", echelle: 1, delai: "0.15s" },
    { gauche: "82%", echelle: 0.8, delai: "0.3s" },
  ];
  return (
    <>
      {positions.map((p, i) => {
        const hauteur = (9 + t * 13) * p.echelle; // 9px -> 22px : dépasse le badge (~18px) à mesure que t grandit
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            width={hauteur * 0.62}
            height={hauteur}
            aria-hidden
            className="limak-flamme pointer-events-none absolute bottom-2 -translate-x-1/2"
            style={{
              left: p.gauche,
              animationDuration: `${1.1 - t * 0.5}s`,
              animationDelay: p.delai,
              filter: `drop-shadow(0 0 ${2 + t * 5}px rgba(241, 114, 10, ${0.5 + t * 0.4}))`,
            }}
          >
            <defs>
              <linearGradient id={`${id}-${i}`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={bordCouleur} />
                <stop offset="100%" stopColor={centreCouleur} />
              </linearGradient>
            </defs>
            <path
              fill={`url(#${id}-${i})`}
              d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
            />
          </svg>
        );
      })}
    </>
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
  // 0 (petite réduction) -> 1 (réduction max crédible) : pilote l'intensité du badge "feu".
  const intensitePromo = reduction / REDUCTION_MAX_CREDIBLE;
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

        {/* Badge "Nouveau" en haut à droite — le badge promo est plus bas, sorti de ce
            conteneur (overflow-hidden) pour que ses flammes aient la place de déborder. */}
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

      {/* Badge promo, sorti du conteneur photo (overflow-hidden) pour que les
          flammes puissent visiblement déborder au-dessus du badge. Offset
          14px = mêmes 6px qu'avant + les 8px de padding (p-2) du conteneur. */}
      {enPromo && !epuise && (
        <span className="absolute right-3.5 top-3.5 z-10">
          <span className="relative inline-block">
            <FlammesBadge intensite={intensitePromo} />
            <span
              className="limak-badge-feu relative block rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
              style={{
                backgroundImage: `linear-gradient(120deg, ${teinteFeu(intensitePromo, BORD_FEU)} 0%, ${teinteFeu(intensitePromo, CENTRE_FEU)} 50%, ${teinteFeu(intensitePromo, BORD_FEU)} 100%)`,
                backgroundSize: "300% 100%",
                animationDuration: `${1.8 - intensitePromo * 1.1}s`,
                boxShadow: `0 0 ${2 + intensitePromo * 10}px rgba(241, 114, 10, ${0.4 + intensitePromo * 0.5})`,
              }}
            >
              -{reduction}%
            </span>
          </span>
        </span>
      )}

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
