// ============================================================
//  PAGE D'ACCUEIL  ->  /
//  Hero immersif + catégories + bannières + ventes flash + premium
//  spotlight + nouveautés + confiance + footer. Cartes réutilisables.
//  Palette LIMAK : doré #C9A84C + bleu nuit #14213D (dominants),
//  orange #F1720A réservé aux boutons d'action.
// ============================================================

import Link from "next/link";
import { prisma } from "./lib/prisma";
import HeroCarousel from "./components/HeroCarousel";
import ProductPhoto from "./components/ProductPhoto";
import ProductCard from "./components/ProductCard";
import ProductSection, { type Disposition } from "./components/ProductSection";
import VentesFlash from "./components/VentesFlash";
import PromoBanner from "./components/PromoBanner";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import Reveal from "./components/Reveal";
import { toDisplayItems, epuisesEnDernier } from "./lib/displayItems";

// Rotation des dispositions pour casser la monotonie en descendant la page.
const ROTATION_DISPOSITIONS: Disposition[] = ["grille", "scroll", "decale"];
// Au-delà, une "promo" ressemble plus à une erreur de saisie qu'à une vraie remise.
const REDUCTION_MAX_CREDIBLE = 60;

export default async function Accueil() {
  const IMAGES_GENERALES = { where: { colorId: null }, orderBy: { position: "asc" as const }, take: 2 };
  const COULEURS = {
    orderBy: { position: "asc" as const },
    include: {
      images: { orderBy: { position: "asc" as const }, take: 2, select: { url: true, alt: true, width: true, height: true } },
    },
  };
  const VARIANTS_COMPLET = { select: { colorId: true, price: true, comparePrice: true, stock: true } };

  const categories = await prisma.category.findMany({
    include: {
      products: {
        where: { isActive: true },
        include: { images: IMAGES_GENERALES, colors: COULEURS, variants: VARIANTS_COMPLET },
        take: 4,
      },
    },
    orderBy: { name: "asc" },
  });

  const nouveautes = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: IMAGES_GENERALES, colors: COULEURS, variants: VARIANTS_COMPLET },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const categoriesAvecProduits = categories.filter((c) => c.products.length > 0);

  // Ventes flash : produits actifs ayant une variante en promo (comparePrice > prix).
  const produitsAvecPromo = await prisma.product.findMany({
    where: { isActive: true, variants: { some: { comparePrice: { not: null } } } },
    include: { images: IMAGES_GENERALES, colors: COULEURS, variants: VARIANTS_COMPLET },
    take: 12,
  });

  // "Premium Spotlight" : les 3 articles les plus chers (prix de la variante la moins chère).
  const tousActifs = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: IMAGES_GENERALES, colors: COULEURS, variants: VARIANTS_COMPLET },
  });
  const premiumSpotlight = [...tousActifs]
    .sort((a, b) => {
      const prixMin = (p: typeof a) => Math.min(...p.variants.map((v) => v.price), Infinity);
      return prixMin(b) - prixMin(a);
    })
    .slice(0, 3);

  // Notes moyennes de TOUS les produits affichés
  const idsAffiches = Array.from(
    new Set([
      ...nouveautes.map((p) => p.id),
      ...categories.flatMap((c) => c.products.map((p) => p.id)),
      ...produitsAvecPromo.map((p) => p.id),
      ...premiumSpotlight.map((p) => p.id),
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

  // Une carte par couleur (densité du catalogue) — chacune ouvre la même fiche produit.
  const nouveautesAffichees = epuisesEnDernier(
    nouveautes.flatMap((p) => toDisplayItems(p, notesParProduit.get(p.id)))
  );
  const ventesFlash = epuisesEnDernier(
    produitsAvecPromo.flatMap((p) => toDisplayItems(p, notesParProduit.get(p.id))).filter((item) => {
      if (item.comparePrice == null || item.comparePrice <= item.price) return false;
      const reduction = Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100);
      return reduction <= REDUCTION_MAX_CREDIBLE;
    })
  );
  const premiumAffiches = premiumSpotlight.flatMap((p) => toDisplayItems(p, notesParProduit.get(p.id))).slice(0, 3);

  // Images pour les bannières publicitaires (photos déjà en catalogue).
  const [bannerSneakers, bannerChaussuresFemme, bannerBerluti] = await Promise.all([
    prisma.product.findUnique({ where: { slug: "nike-air-max-90" }, select: { images: { take: 1, select: { url: true } } } }),
    prisma.product.findUnique({
      where: { slug: "mules-plateforme-aaron-fay" },
      select: { colors: { take: 1, select: { images: { take: 1, select: { url: true } } } } },
    }),
    prisma.product.findUnique({
      where: { slug: "berluti-shadow-knit" },
      select: { colors: { take: 1, select: { images: { take: 1, select: { url: true } } } } },
    }),
  ]);

  return (
    <div className="bg-[#FBEEDA] dark:bg-[#1c2333]">
      {/* 3. HERO IMMERSIF */}
      <HeroCarousel />

      {/* 4. CATÉGORIES VISUELLES */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-1 text-2xl font-bold text-[#14213D] dark:text-gray-300">Explorez nos catégories</h2>
          <span className="mb-6 block h-1 w-14 rounded-full bg-[#C9A84C]" aria-hidden />
          <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-6">
            {categories.map((c, i) => {
              const cover =
                c.products[0]?.images[0]?.url ?? c.products[0]?.colors[0]?.images[0]?.url ?? null;
              return (
                <Reveal key={c.id} delay={i * 60} className="w-28 shrink-0 sm:w-auto">
                  <Link
                    href={`/produits?categorie=${c.slug}`}
                    className="group relative block aspect-square overflow-hidden rounded-full border-[3px] border-[#C9A84C] bg-neutral-200 transition duration-300 hover:scale-105 hover:shadow-[0_0_0_6px_rgba(201,168,76,0.25)]"
                  >
                    <ProductPhoto src={cover} alt={c.name} sizes="140px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="absolute inset-x-1 bottom-2 z-10 text-center text-xs font-bold text-white drop-shadow sm:text-sm">
                      {c.name}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      </Reveal>

      {/* 5. BANNIÈRE PUB #1 — Sneakers */}
      <Reveal>
        <PromoBanner
          href="/produits?categorie=chaussures"
          title="Collection Sneakers 2026"
          subtitle="Style & performance"
          imageUrl={bannerSneakers?.images[0]?.url ?? null}
          variant="navy"
        />
      </Reveal>

      {/* 6. BONNES AFFAIRES DU JOUR */}
      <Reveal>
        <VentesFlash produits={ventesFlash} />
      </Reveal>

      {/* 7. BANNIÈRE PUB #2 — Chaussures femme */}
      <Reveal>
        <PromoBanner
          href="/produits?categorie=chaussures"
          title="Élégance au Féminin"
          subtitle="Escarpins & mules"
          imageUrl={bannerChaussuresFemme?.colors[0]?.images[0]?.url ?? null}
          variant="gold-navy"
        />
      </Reveal>

      {/* 8. PREMIUM SPOTLIGHT */}
      {premiumAffiches.length > 0 && (
        <Reveal>
          <section className="mx-auto max-w-6xl px-4 py-10">
            <h2 className="mb-1 text-2xl font-bold text-[#14213D] dark:text-gray-300">Sélection Premium</h2>
            <span className="mb-6 block h-1 w-14 rounded-full bg-[#C9A84C]" aria-hidden />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {premiumAffiches.map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
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
                    premium
                  />
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* 9. BANNIÈRE PUB #3 — Berluti */}
      <Reveal>
        <PromoBanner
          href="/produits?categorie=chaussures"
          title="LIMAK Premium"
          subtitle="Berluti, l'excellence parisienne"
          imageUrl={bannerBerluti?.colors[0]?.images[0]?.url ?? null}
          variant="luxe"
          cta="Voir la collection"
        />
      </Reveal>

      {/* 10. NOUVEAUTÉS */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="mb-1 text-2xl font-bold text-[#14213D] dark:text-gray-300">Nouveautés</h2>
              <span className="block h-1 w-14 rounded-full bg-[#C9A84C]" aria-hidden />
            </div>
            <Link href="/produits" className="text-sm font-semibold text-[#C9A84C] hover:underline">
              Voir tout →
            </Link>
          </div>
          <ProductSection disposition={ROTATION_DISPOSITIONS[0]} variante={0} produits={nouveautesAffichees} />
        </section>
      </Reveal>

      {/* RANGÉES PAR CATÉGORIE */}
      {categoriesAvecProduits.map((c, i) => (
        <Reveal key={c.id}>
          <section className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="mb-1 text-2xl font-bold text-[#14213D] dark:text-gray-300">{c.name}</h2>
                <span className="block h-1 w-14 rounded-full bg-[#C9A84C]" aria-hidden />
              </div>
              <Link href={`/produits?categorie=${c.slug}`} className="text-sm font-semibold text-[#C9A84C] hover:underline">
                Voir tout →
              </Link>
            </div>
            <ProductSection
              disposition={ROTATION_DISPOSITIONS[(i + 1) % ROTATION_DISPOSITIONS.length]}
              variante={i + 1}
              produits={epuisesEnDernier(c.products.flatMap((p) => toDisplayItems(p, notesParProduit.get(p.id))))}
            />
          </section>
        </Reveal>
      ))}

      {/* 11. BANNIÈRE PUB #4 — Confiance / livraison */}
      <Reveal>
        <PromoBanner
          href="/produits"
          title="Livraison partout en Côte d'Ivoire 🇨🇮"
          subtitle="Paiement à la livraison — commandez en toute confiance"
          variant="navy"
          cta="Commander"
        />
      </Reveal>

      {/* APPEL FINAL */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-2xl border-2 border-[#C9A84C]/40 bg-[#14213D] px-6 py-12 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">Prêt à faire vos achats ?</h2>
            <p className="mx-auto mt-2 max-w-md text-neutral-300">
              Parcourez tout le catalogue et commandez en quelques clics.
            </p>
            <Link
              href="/produits"
              className="mt-6 inline-block rounded-full bg-[#F1720A] px-8 py-3 font-semibold text-white transition hover:scale-105 hover:bg-[#C95900]"
            >
              Voir tous les articles
            </Link>
          </div>
        </section>
      </Reveal>

      {/* 12. TÉMOIGNAGES / CONFIANCE */}
      <Testimonials />

      {/* 13. FOOTER */}
      <Footer />
    </div>
  );
}
