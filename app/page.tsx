// ============================================================
//  PAGE D'ACCUEIL  ->  /
//  Carrousel + réassurance + catégories + nouveautés +
//  rangées par catégorie + pied de page. Cartes réutilisables.
// ============================================================

import Link from "next/link";
import { prisma } from "./lib/prisma";
import HeroCarousel from "./components/HeroCarousel";
import ProductThumb from "./components/ProductThumb";
import ProductSection, { type Disposition } from "./components/ProductSection";
import VentesFlash from "./components/VentesFlash";
import Reveal from "./components/Reveal";

// Rotation des dispositions pour casser la monotonie en descendant la page
// (même logique que sur /produits) : une par rangée (nouveautés, puis chaque catégorie).
const ROTATION_DISPOSITIONS: Disposition[] = ["grille", "scroll", "decale", "cercle"];

// Icônes de la bande de réassurance (traits fins, plus sobres que des emojis).
function IconeCamion({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 3h13v13H1z" />
      <path d="M14 8h4l4 4v4h-8V8z" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}
function IconeBillet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 6v0M18 6v0M6 18v0M18 18v0" />
    </svg>
  );
}
function IconeBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l2.4 2.1 3.1-.4.6 3.1 2.9 1.4-1.4 2.9 1.4 2.9-2.9 1.4-.6 3.1-3.1-.4L12 21l-2.4-2.1-3.1.4-.6-3.1-2.9-1.4 1.4-2.9-1.4-2.9 2.9-1.4.6-3.1 3.1.4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconeCadenas({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

const REASSURANCE = [
  { Icone: IconeCamion, titre: "Livraison rapide" },
  { Icone: IconeBillet, titre: "Paiement à la livraison" },
  { Icone: IconeBadge, titre: "Articles vérifiés" },
  { Icone: IconeCadenas, titre: "Achat sécurisé" },
];

export default async function Accueil() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: { isActive: true },
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          variants: { orderBy: { price: "asc" }, take: 1 },
        },
        take: 4,
      },
    },
    orderBy: { name: "asc" },
  });

  const nouveautes = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { orderBy: { price: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const categoriesAvecProduits = categories.filter((c) => c.products.length > 0);

  // Ventes flash : produits actifs ayant une variante en promo (comparePrice > prix).
  const produitsAvecPromo = await prisma.product.findMany({
    where: { isActive: true, variants: { some: { comparePrice: { not: null } } } },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { orderBy: { price: "asc" }, take: 1 },
    },
    take: 12,
  });
  const ventesFlash = produitsAvecPromo.filter(
    (p) => p.variants[0]?.comparePrice != null && p.variants[0].comparePrice > p.variants[0].price
  );

  // Notes moyennes de TOUS les produits affichés (nouveautés + rangées + ventes flash)
  const idsAffiches = Array.from(
    new Set([
      ...nouveautes.map((p) => p.id),
      ...categories.flatMap((c) => c.products.map((p) => p.id)),
      ...ventesFlash.map((p) => p.id),
    ])
  );
  const notes = idsAffiches.length
    ? await prisma.review.groupBy({
        by: ["productId"],
        where: { productId: { in: idsAffiches } },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];
  const notesParProduit = new Map(
    notes.map((n) => [n.productId, { moyenne: n._avg.rating ?? 0, nb: n._count.rating }])
  );

  return (
    <div className="bg-[#FBEEDA] dark:bg-[#1c2333]">
      <HeroCarousel />

      {/* RÉASSURANCE */}
      <section className="mt-6 bg-[#14213D]">
        <div className="scrollbar-none mx-auto flex max-w-6xl items-center justify-start gap-5 overflow-x-auto px-4 py-2 sm:justify-center sm:gap-8">
          {REASSURANCE.map(({ Icone, titre }, i) => (
            <div key={titre} className="flex shrink-0 items-center gap-4 sm:gap-8">
              {i > 0 && <span className="h-3 w-px shrink-0 bg-[#FBEEDA]/20" aria-hidden />}
              <div className="flex shrink-0 items-center gap-1.5">
                <Icone className="h-3.5 w-3.5 shrink-0 text-[#F1720A]" />
                <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-[#FBEEDA]/85 sm:text-[11px]">
                  {titre}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VENTES FLASH */}
      <Reveal>
        <VentesFlash
          produits={ventesFlash.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: p.variants[0]?.price ?? 0,
            comparePrice: p.variants[0]?.comparePrice ?? null,
            imageUrl: p.images[0]?.url ?? null,
            imageAlt: p.images[0]?.alt ?? null,
            stock: p.variants[0]?.stock ?? 0,
            note: notesParProduit.get(p.id),
          }))}
        />
      </Reveal>

      {/* CATÉGORIES */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="mb-6 text-2xl font-bold text-[#14213D] dark:text-gray-300">
            Explorez nos catégories
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {categories.map((c, i) => {
              const cover = c.products[0]?.images[0]?.url ?? null;
              return (
                <Reveal key={c.id} delay={i * 60}>
                  <Link
                    href={`/produits?categorie=${c.slug}`}
                    className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-neutral-200"
                  >
                    <ProductThumb src={cover} alt={c.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 group-hover:from-black/80" />
                    <span className="absolute bottom-3 left-3 z-10 text-lg font-bold text-white drop-shadow">
                      {c.name}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      </Reveal>

      {/* NOUVEAUTÉS */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 pb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#14213D] dark:text-gray-300">Nouveautés</h2>
            <Link href="/produits" className="text-sm font-semibold text-[#C95900] hover:underline">
              Voir tout →
            </Link>
          </div>
          <ProductSection
            disposition={ROTATION_DISPOSITIONS[0]}
            variante={0}
            produits={nouveautes.map((p) => ({
              id: p.id,
              slug: p.slug,
              name: p.name,
              price: p.variants[0]?.price ?? 0,
              comparePrice: p.variants[0]?.comparePrice ?? null,
              imageUrl: p.images[0]?.url ?? null,
              imageAlt: p.images[0]?.alt ?? null,
              stock: p.variants[0]?.stock ?? 0,
              note: notesParProduit.get(p.id),
            }))}
          />
        </section>
      </Reveal>

      {/* RANGÉE PAR CATÉGORIE */}
      {categoriesAvecProduits.map((c, i) => (
        <Reveal key={c.id}>
          <section className="mx-auto max-w-6xl px-4 py-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#14213D] dark:text-gray-300">{c.name}</h2>
              <Link href={`/produits?categorie=${c.slug}`} className="text-sm font-semibold text-[#C95900] hover:underline">
                Voir tout →
              </Link>
            </div>
            <ProductSection
              disposition={ROTATION_DISPOSITIONS[(i + 1) % ROTATION_DISPOSITIONS.length]}
              variante={i + 1}
              produits={c.products.map((p) => ({
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: p.variants[0]?.price ?? 0,
                comparePrice: p.variants[0]?.comparePrice ?? null,
                imageUrl: p.images[0]?.url ?? null,
                imageAlt: p.images[0]?.alt ?? null,
                stock: p.variants[0]?.stock ?? 0,
                note: notesParProduit.get(p.id),
              }))}
            />
          </section>
        </Reveal>
      ))}

      {/* APPEL FINAL */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-2xl bg-[#14213D] px-6 py-12 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">Prêt à faire vos achats ?</h2>
            <p className="mx-auto mt-2 max-w-md text-neutral-300">
              Parcourez tout le catalogue et commandez en quelques clics.
            </p>
            <Link href="/produits" className="mt-6 inline-block rounded-full bg-[#F1720A] px-8 py-3 font-semibold text-white transition hover:bg-[#C95900] hover:scale-105">
              Voir tous les articles
            </Link>
          </div>
        </section>
      </Reveal>

      {/* PIED DE PAGE */}
      <footer className="border-t border-[#14213D]/10 bg-[#FFFBF3] dark:border-white/15 dark:bg-[#1c2333]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
            <div>
              <p className="text-xl font-extrabold text-[#14213D] dark:text-gray-300">LIMAK</p>
              <p className="mt-2 max-w-xs text-sm text-neutral-500 dark:text-gray-400">
                Votre boutique en ligne en Côte d&apos;Ivoire. Paiement à la livraison.
              </p>
            </div>
            <div className="text-sm text-neutral-600 dark:text-gray-400">
              <p className="font-semibold text-neutral-800 dark:text-gray-300">Une question ?</p>
              <p className="mt-2">Email : limak.shopall@gmail.com</p>
              <p>WhatsApp : +225 07 17 67 87 84</p>
              <p className="mt-1 text-xs text-neutral-400 dark:text-gray-400">
                (pour vos questions — les commandes se passent sur le site)
              </p>
            </div>
          </div>
          <p className="mt-8 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-400 dark:border-white/15 dark:text-gray-400">
            © {new Date().getFullYear()} LIMAK. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}