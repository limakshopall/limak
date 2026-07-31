// ============================================================
//  BANDEAU "VENTES FLASH" — met en avant les produits en promo
//  avec un compte à rebours, façon Jumia/Temu. Rien à faire côté
//  admin : basé sur les promos déjà actives (comparePrice).
// ============================================================

import ProductCard from "./ProductCard";
import Countdown from "./Countdown";

type Note = { moyenne: number; nb: number };

type Produit = {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  stock: number;
  note?: Note;
};

export default function VentesFlash({ produits }: { produits: Produit[] }) {
  if (produits.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#D6293E] to-[#C95900] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>⚡</span>
            <h2 className="text-xl font-extrabold text-white sm:text-2xl">Ventes flash</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-white/80">
              Se termine dans
            </span>
            <Countdown />
          </div>
        </div>
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
          {produits.map((p) => (
            <div key={p.id} className="w-[42%] shrink-0 sm:w-[190px]">
              <ProductCard
                slug={p.slug}
                name={p.name}
                price={p.price}
                comparePrice={p.comparePrice}
                imageUrl={p.imageUrl}
                imageAlt={p.imageAlt}
                note={p.note}
                stock={p.stock}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
