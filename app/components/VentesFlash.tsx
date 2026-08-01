// ============================================================
//  BANDEAU "BONNES AFFAIRES DU JOUR" — met en avant les produits
//  en promo avec un compte à rebours. Habillage propre à LIMAK
//  (indigo + mangue, halo comme le carrousel) plutôt qu'un calque
//  du bandeau rouge/éclair générique des grandes plateformes.
// ============================================================

import ProductCard from "./ProductCard";
import Countdown from "./Countdown";

type Note = { moyenne: number; nb: number };

type Produit = {
  id: string;
  slug: string;
  colorId?: string | null;
  name: string;
  price: number;
  comparePrice: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  imageUrlHover?: string | null;
  stock: number;
  isNew?: boolean;
  note?: Note;
};

function IconeSablier({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export default function VentesFlash({ produits }: { produits: Produit[] }) {
  if (produits.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="relative overflow-hidden rounded-2xl border border-[#C9A84C]/30 bg-[#14213D] p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -left-12 -top-12 h-56 w-56 rounded-full opacity-25 blur-3xl"
          style={{ background: "#C9A84C" }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full opacity-15 blur-3xl"
          style={{ background: "#F1720A" }}
        />

        <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C9A84C]/15">
              <IconeSablier className="h-4 w-4 text-[#C9A84C]" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                Bonnes affaires du jour
              </h2>
              <p className="text-xs text-white/50">Renouvelées chaque jour</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-white/60">
              Encore
            </span>
            <Countdown />
          </div>
        </div>

        <div className="relative scrollbar-none flex gap-3 overflow-x-auto pb-1">
          {produits.map((p) => (
            <div key={p.id} className="w-[42%] shrink-0 sm:w-[190px]">
              <ProductCard
                slug={p.slug}
                colorId={p.colorId}
                name={p.name}
                price={p.price}
                comparePrice={p.comparePrice}
                imageUrl={p.imageUrl}
                imageAlt={p.imageAlt}
                imageWidth={p.imageWidth}
                imageHeight={p.imageHeight}
                imageUrlHover={p.imageUrlHover}
                note={p.note}
                stock={p.stock}
                isNew={p.isNew}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
