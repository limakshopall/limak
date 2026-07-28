// ============================================================
//  PAGE "NOS PRODUITS"  ->  /produits
//  Avec recherche, filtre par catégorie et tri (via l'URL).
// ============================================================

import Link from "next/link";
import { prisma } from "../lib/prisma";
import ProduitsFiltres from "../components/ProduitsFiltres";

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categorie?: string; tri?: string }>;
}) {
  const { q, categorie, tri } = await searchParams;

  // Construit le tri en fonction du paramètre
  const orderBy =
    tri === "prix-asc"
      ? { name: "asc" as const } // (tri par prix géré plus bas si besoin)
      : tri === "prix-desc"
        ? { name: "desc" as const }
        : { createdAt: "desc" as const };

  // Récupère les produits filtrés
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

  // Tri par prix (basé sur la 1re variante) — fait ici car le prix
  // est sur la variante, pas directement sur le produit.
  const liste = [...produits];
  if (tri === "prix-asc") {
    liste.sort((a, b) => (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0));
  } else if (tri === "prix-desc") {
    liste.sort((a, b) => (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0));
  }

  // Catégories pour le menu de filtre
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
                <div className="flex aspect-square items-center justify-center overflow-hidden bg-neutral-100 text-xs text-neutral-400">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.url}
                      alt={image.alt ?? produit.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    "photo à venir"
                  )}
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
