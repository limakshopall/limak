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
}: {
  slug: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  imageUrl: string | null;
  imageAlt?: string | null;
  note?: Note;
  stock?: number;
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
      className="group overflow-hidden rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <div className={epuise ? "opacity-40" : ""}>
          <ProductThumb src={imageUrl} alt={imageAlt ?? name} />
        </div>

        {/* Badge promo (en haut à droite) */}
        {enPromo && !epuise && (
          <span className="absolute right-2 top-2 rounded-full bg-[#D6293E] px-2 py-0.5 text-xs font-bold text-white">
            -{reduction}%
          </span>
        )}

        {/* Badge "Épuisé" (en haut à gauche) */}
        {epuise && (
          <span className="absolute left-2 top-2 rounded-full bg-neutral-700 px-2 py-0.5 text-xs font-semibold text-white">
            Épuisé
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-[#14213D]">{name}</h3>

        {/* Prix (avec ancien prix barré si promo) */}
        <div className="mt-1 flex items-baseline gap-2">
          <p className="font-bold text-[#14213D]">
            {new Intl.NumberFormat("fr-FR").format(price)} FCFA
          </p>
          {enPromo && (
            <p className="text-xs text-neutral-400 line-through">
              {new Intl.NumberFormat("fr-FR").format(comparePrice!)} FCFA
            </p>
          )}
        </div>

        {note && note.nb > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            <Stars value={note.moyenne} />
            <span className="text-neutral-500">({note.nb})</span>
          </div>
        )}

        {stockBas && (
          <p className="mt-1 text-xs font-semibold text-[#D6293E]">
            Plus que {stock} en stock
          </p>
        )}
      </div>
    </Link>
  );
}