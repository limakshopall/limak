// ============================================================
//  PAGE "NOS PRODUITS"  ->  /produits
//  Recherche + filtre catégorie + tri. Images optimisées.
// ============================================================

import Link from "next/link";
import { prisma } from "../lib/prisma";
import ProduitsFiltres from "../components/ProduitsFiltres";
import ProductThumb from "../components/ProductThumb";

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categorie?: string; tri?: string }>;
}) {
  const { q, categorie, tri } = await searchParams;

  const orderBy =
    tri === "prix-asc"
      ? { name: "asc" as const }
      : tri === "prix-desc"
        ? { name: "desc" as const }
        : { createdAt: "desc" as const };

  const produits = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(categorie ? { category: { slug: categorie } } : {}),
    },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { orderBy: { price: "asc" }, take: 1 },
    },
    orderBy,
  });

  const liste = [...produits];
  if (tri === "prix-asc") {
    liste.sort((a, b) => (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0));
  } else if (tri === "prix-desc") {
    liste.sort((a, b) => (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0));
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Nos produits</h1>

      <ProduitsFiltres categories={categories} />

      {liste.length === 0 ? (
        <p className="text-neutral-500">
          Aucun produit ne correspond à votre recherche.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {liste.map((produit) => {
            const prix = produit.variants[0]?.price ?? 0;
            const image = produit.images[0];
            return (
              <Link
                key={produit.id}
                href={`/produits/${produit.slug}`}
                className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  <ProductThumb src={image?.url ?? null} alt={image?.alt ?? produit.name} />
                </div>
                <div className="p-3">
                  <h2 className="truncate text-sm font-medium text-neutral-800">
                    {produit.name}
                  </h2>
                  <p className="mt-1 font-bold text-neutral-900">
                    {new Intl.NumberFormat("fr-FR").format(prix)} FCFA
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
