// ============================================================
//  CARTE PRODUIT réutilisable (accueil + catalogue)
//  Image + nom + prix + note moyenne en étoiles.
// ============================================================

import Link from "next/link";
import ProductThumb from "./ProductThumb";

// Étoiles non interactives pour une note moyenne.
function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="leading-none">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? "text-orange-500" : "text-neutral-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

type Note = { moyenne: number; nb: number };

export default function ProductCard({
  slug,
  name,
  price,
  imageUrl,
  imageAlt,
  note,
}: {
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  imageAlt?: string | null;
  note?: Note;
}) {
  return (
    <Link
      href={`/produits/${slug}`}
      className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <ProductThumb src={imageUrl} alt={imageAlt ?? name} />
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-neutral-800">{name}</h3>
        <p className="mt-1 font-bold text-neutral-900">
          {new Intl.NumberFormat("fr-FR").format(price)} FCFA
        </p>

        {/* Note moyenne, seulement s'il y a au moins un avis */}
        {note && note.nb > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            <Stars value={note.moyenne} />
            <span className="text-neutral-500">({note.nb})</span>
          </div>
        )}
      </div>
    </Link>
  );
}