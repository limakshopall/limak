// ============================================================
//  TÉMOIGNAGES & BADGES DE CONFIANCE — Server Component
//  Reprend les meilleurs avis clients (notes ≥ 4, avec commentaire)
//  laissés sur les fiches produits. Pas de photo client en base :
//  un avatar "initiale" doré remplace la photo.
// ============================================================

import { prisma } from "../lib/prisma";

function IconeBouclier({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function IconeCamionConfiance({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 3h13v13H1z" />
      <path d="M14 8h4l4 4v4h-8V8z" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}
function IconeRetour({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

const BADGES = [
  { Icone: IconeBouclier, label: "Paiement sécurisé" },
  { Icone: IconeCamionConfiance, label: "Livraison rapide" },
  { Icone: IconeRetour, label: "Satisfait ou remboursé" },
];

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="text-sm leading-none text-[#C9A84C]">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? "" : "opacity-25"}>★</span>
      ))}
    </span>
  );
}

export default async function Testimonials() {
  const avis = await prisma.review.findMany({
    where: { rating: { gte: 4 }, comment: { not: null } },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: 8,
    select: { id: true, authorName: true, rating: true, comment: true },
  });

  return (
    <section className="bg-[#FBEEDA] py-10 dark:bg-[#1c2333]">
      <div className="mx-auto max-w-6xl px-4">
        {/* Badges de confiance */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {BADGES.map(({ Icone, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icone className="h-5 w-5 shrink-0 text-[#C9A84C]" />
              <span className="text-sm font-semibold text-[#14213D] dark:text-gray-300">{label}</span>
            </div>
          ))}
        </div>

        {avis.length > 0 && (
          <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
            {avis.map((a) => (
              <div
                key={a.id}
                className="w-[80%] shrink-0 snap-start rounded-2xl border border-[#C9A84C]/30 bg-[#FFFBF3] p-5 shadow-sm dark:border-white/15 dark:bg-[#05070d] sm:w-[320px]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#14213D] text-sm font-bold text-[#C9A84C]">
                    {a.authorName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#14213D] dark:text-gray-300">{a.authorName}</p>
                    <Stars value={a.rating} />
                  </div>
                </div>
                <p className="mt-3 line-clamp-4 text-sm text-neutral-600 dark:text-gray-400">
                  {a.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
