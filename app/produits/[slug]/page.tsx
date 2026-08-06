// ============================================================
//  FICHE PRODUIT  ->  /produits/<slug>
//  Server Component : lit la base. Galerie + bouton + avis + similaires.
// ============================================================

import ShareButtons from "./ShareButtons";
import { prisma } from "../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ProductPurchase from "./ProductPurchase";
import ReviewForm from "./ReviewForm";
import ProductCard from "../../components/ProductCard";

// Petit affichage d'étoiles (non interactif) pour une note donnée.
function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span aria-label={`${value.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? "text-[#C95900]" : "text-neutral-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const produit = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  if (!produit) {
    return { title: "Article introuvable" };
  }

  const image = produit.images[0]?.url;
  const description =
    produit.description?.slice(0, 160) ||
    `${produit.name} disponible sur LIMAK. Paiement à la livraison en Côte d'Ivoire.`;

  return {
    title: produit.name,
    description,
    openGraph: {
      title: produit.name,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function FicheProduit({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ couleur?: string }>;
}) {
  const { slug } = await params;
  const { couleur: colorIdInitial } = await searchParams;

  const produit = await prisma.product.findUnique({
    where: { slug },
    include: {
      // Photos générales (non rattachées à une couleur ou une taille précise).
      images: { where: { colorId: null, sizeId: null }, orderBy: { position: "asc" } },
      colors: {
        orderBy: { position: "asc" },
        include: { images: { orderBy: { position: "asc" }, select: { id: true, url: true, alt: true } } },
      },
      sizes: {
        orderBy: { position: "asc" },
        include: { images: { orderBy: { position: "asc" }, select: { id: true, url: true, alt: true } } },
      },
      // select explicite : costPrice (prix fournisseur) ne doit jamais atteindre le client.
      variants: {
        orderBy: { price: "asc" },
        select: {
          id: true,
          colorId: true,
          sizeId: true,
          price: true,
          comparePrice: true,
          stock: true,
        },
      },
      category: true,
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!produit) {
    notFound();
  }

  const prix = produit.variants[0]?.price ?? 0;

  const avis = produit.reviews;
  const nbAvis = avis.length;
  const moyenne = nbAvis ? avis.reduce((s, a) => s + a.rating, 0) / nbAvis : 0;

  // --- Produits similaires : même catégorie, sauf le produit courant ---
  const similaires = produit.categoryId
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          categoryId: produit.categoryId,
          id: { not: produit.id },
        },
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          variants: { orderBy: { price: "asc" }, take: 1 },
        },
        take: 4,
      })
    : [];

  // Notes moyennes des produits similaires (pour les étoiles sur leurs cartes)
  const idsSim = similaires.map((p) => p.id);
  const notesSim = idsSim.length
    ? await prisma.review.groupBy({
        by: ["productId"],
        where: { productId: { in: idsSim } },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];
  const notesSimParProduit = new Map(
    notesSim.map((n) => [n.productId, { moyenne: n._avg.rating ?? 0, nb: n._count.rating }])
  );

  return (
    <main className="mx-auto max-w-5xl bg-[#FBEEDA] px-4 pb-24 pt-6 dark:bg-[#1c2333] sm:pb-8 sm:pt-8">
      <Link
        href="/produits"
        className="mb-4 inline-block text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400 dark:hover:text-gray-100"
      >
        ← Retour aux articles
      </Link>

      <div className="grid gap-6 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d] sm:p-6 md:grid-cols-2">
        <ProductPurchase
          productId={produit.id}
          slug={produit.slug}
          name={produit.name}
          fallbackImages={produit.images}
          colors={produit.colors}
          sizes={produit.sizes}
          variants={produit.variants}
          initialColorId={colorIdInitial ?? null}
          before={
            <>
              {produit.category && (
                <p className="text-sm text-neutral-500 dark:text-gray-400">{produit.category.name}</p>
              )}
              <h1 className="mt-1 text-3xl font-extrabold text-[#14213D] dark:text-gray-300">
                {produit.name}
              </h1>

              {nbAvis > 0 && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Stars value={moyenne} />
                  <span className="text-neutral-600 dark:text-gray-400">
                    {moyenne.toFixed(1)} · {nbAvis} avis
                  </span>
                </div>
              )}

              {produit.description && (
                <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-700 dark:text-gray-300">
                  {produit.description}
                </p>
              )}
            </>
          }
          after={<ShareButtons slug={produit.slug} name={produit.name} price={prix} />}
        />
      </div>

      {/* --- SECTION AVIS CLIENTS --- */}
      <section className="mt-8 border-t border-[#14213D]/10 pt-6 dark:border-white/15">
        <h2 className="text-xl font-bold text-[#14213D] dark:text-gray-300">
          Avis clients{nbAvis > 0 && ` (${nbAvis})`}
        </h2>

        <ReviewForm productId={produit.id} slug={produit.slug} />

        <div className="mt-6 space-y-3">
          {nbAvis === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-gray-400">
              Aucun avis pour le moment. Soyez le premier à en laisser un !
            </p>
          ) : (
            avis.map((a) => (
              <div key={a.id} className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#14213D] dark:text-gray-300">
                    {a.authorName}
                    <span className="ml-2 rounded-full bg-[#1F7A5C]/10 px-2 py-0.5 text-xs font-medium text-[#1F7A5C]">
                      ✓ Achat vérifié
                    </span>
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-gray-400">
                    {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="mt-1 text-sm">
                  <Stars value={a.rating} />
                </div>
                {a.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-gray-300">
                    {a.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* --- PRODUITS SIMILAIRES --- */}
      {similaires.length > 0 && (
        <section className="mt-8 border-t border-[#14213D]/10 pt-6 dark:border-white/15">
          <h2 className="mb-4 text-xl font-bold text-[#14213D] dark:text-gray-300">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {similaires.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                price={p.variants[0]?.price ?? 0}
                imageUrl={p.images[0]?.url ?? null}
                imageAlt={p.images[0]?.alt ?? null}
                imageWidth={p.images[0]?.width ?? null}
                imageHeight={p.images[0]?.height ?? null}
                note={notesSimParProduit.get(p.id)}
                stock={p.variants[0]?.stock ?? 0}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}