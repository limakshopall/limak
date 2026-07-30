// ============================================================
//  PAGE D'ACCUEIL  ->  /
//  Carrousel + réassurance + catégories + nouveautés +
//  rangées par catégorie + pied de page. Cartes réutilisables.
// ============================================================

import Link from "next/link";
import { prisma } from "./lib/prisma";
import HeroCarousel from "./components/HeroCarousel";
import ProductThumb from "./components/ProductThumb";
import ProductCard from "./components/ProductCard";

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

  // Notes moyennes de TOUS les produits affichés (nouveautés + rangées)
  const idsAffiches = Array.from(
    new Set([
      ...nouveautes.map((p) => p.id),
      ...categories.flatMap((c) => c.products.map((p) => p.id)),
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
    <div className="bg-neutral-50">
      <HeroCarousel />

      {/* RÉASSURANCE */}
      <section className="mt-8 border-y border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 text-sm sm:grid-cols-4">
          {[
            ["🚚", "Livraison rapide", "Partout en Côte d'Ivoire"],
            ["💵", "Paiement à la livraison", "Payez à réception"],
            ["✅", "Produits de qualité", "Sélection vérifiée"],
            ["🔒", "Commande sécurisée", "Directement sur le site"],
          ].map(([emoji, titre, sous]) => (
            <div key={titre} className="flex items-center gap-3">
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="font-semibold text-neutral-800">{titre}</p>
                <p className="text-neutral-500">{sous}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-6 text-2xl font-bold text-neutral-900">
          Explorez nos catégories
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => {
            const cover = c.products[0]?.images[0]?.url ?? null;
            return (
              <Link
                key={c.id}
                href={`/produits?categorie=${c.slug}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-200"
              >
                <ProductThumb src={cover} alt={c.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-3 left-3 z-10 text-lg font-bold text-white drop-shadow">
                  {c.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* NOUVEAUTÉS */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">Nouveautés</h2>
          <Link href="/produits" className="text-sm font-medium text-[#e67e22] hover:underline">
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {nouveautes.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              price={p.variants[0]?.price ?? 0}
              imageUrl={p.images[0]?.url ?? null}
              imageAlt={p.images[0]?.alt ?? null}
              note={notesParProduit.get(p.id)}
            />
          ))}
        </div>
      </section>

      {/* RANGÉE PAR CATÉGORIE */}
      {categoriesAvecProduits.map((c) => (
        <section key={c.id} className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">{c.name}</h2>
            <Link href={`/produits?categorie=${c.slug}`} className="text-sm font-medium text-[#e67e22] hover:underline">
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {c.products.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                price={p.variants[0]?.price ?? 0}
                imageUrl={p.images[0]?.url ?? null}
                imageAlt={p.images[0]?.alt ?? null}
                note={notesParProduit.get(p.id)}
                stock={p.variants[0]?.stock ?? 0}
                comparePrice={p.variants[0]?.comparePrice ?? null}
              />
            ))}
          </div>
        </section>
      ))}

      {/* APPEL FINAL */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-2xl bg-[#0f1724] px-6 py-12 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">Prêt à faire vos achats ?</h2>
          <p className="mx-auto mt-2 max-w-md text-neutral-300">
            Parcourez tout le catalogue et commandez en quelques clics.
          </p>
          <Link href="/produits" className="mt-6 inline-block rounded-full bg-[#e67e22] px-8 py-3 font-semibold text-white transition hover:bg-[#d35400]">
            Voir tous les produits
          </Link>
        </div>
      </section>

      {/* PIED DE PAGE */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
            <div>
              <p className="text-xl font-extrabold text-neutral-900">LIMAK</p>
              <p className="mt-2 max-w-xs text-sm text-neutral-500">
                Votre boutique en ligne en Côte d&apos;Ivoire. Paiement à la livraison.
              </p>
            </div>
            <div className="text-sm text-neutral-600">
              <p className="font-semibold text-neutral-800">Une question ?</p>
              <p className="mt-2">Email : limak.shopall@gmail.com</p>
              <p>WhatsApp : +225 07 17 67 87 84</p>
              <p className="mt-1 text-xs text-neutral-400">
                (pour vos questions — les commandes se passent sur le site)
              </p>
            </div>
          </div>
          <p className="mt-8 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-400">
            © {new Date().getFullYear()} LIMAK. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}