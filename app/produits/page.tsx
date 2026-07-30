// ============================================================
//  PAGE "NOS PRODUITS"  ->  /produits
//  Recherche + filtre catégorie + tri. Cartes réutilisables (ProductCard).
// ============================================================

import type { Metadata } from "next";
import { prisma } from "../lib/prisma";
import ProduitsFiltres from "../components/ProduitsFiltres";
import ProductSection, { type Disposition } from "../components/ProductSection";

// Groupes de produits + rotation des dispositions, pour casser la monotonie en descendant la page.
const TAILLE_GROUPE = 8;
const ROTATION_DISPOSITIONS: Disposition[] = ["grille", "scroll", "decale", "cercle"];

function decouper<T>(liste: T[], taille: number): T[][] {
  const groupes: T[][] = [];
  for (let i = 0; i < liste.length; i += taille) {
    groupes.push(liste.slice(i, i + taille));
  }
  return groupes;
}

export const metadata: Metadata = {
  title: "Nos produits",
  description:
    "Parcourez tout le catalogue LIMAK : montres, sacs, beauté, électroménager, librairie et plus. Paiement à la livraison en Côte d'Ivoire.",
};

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

  // Notes moyennes par produit (pour les étoiles sur les cartes)
  const ids = liste.map((p) => p.id);
  const notes = ids.length
    ? await prisma.review.groupBy({
        by: ["productId"],
        where: { productId: { in: ids } },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];
  const notesParProduit = new Map(
    notes.map((n) => [n.productId, { moyenne: n._avg.rating ?? 0, nb: n._count.rating }])
  );

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });

  // Mise en forme des produits pour les composants d'affichage.
  const produitsAffiches = liste.map((produit) => ({
    id: produit.id,
    slug: produit.slug,
    name: produit.name,
    price: produit.variants[0]?.price ?? 0,
    comparePrice: produit.variants[0]?.comparePrice ?? null,
    imageUrl: produit.images[0]?.url ?? null,
    imageAlt: produit.images[0]?.alt ?? null,
    stock: produit.variants[0]?.stock ?? 0,
    note: notesParProduit.get(produit.id),
  }));

  const groupes = decouper(produitsAffiches, TAILLE_GROUPE);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-[#14213D]">Nos produits</h1>

      <ProduitsFiltres categories={categories} />

      {liste.length === 0 ? (
        <p className="text-neutral-500">
          Aucun produit ne correspond à votre recherche.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {groupes.map((groupe, i) => (
            <ProductSection
              key={i}
              produits={groupe}
              disposition={ROTATION_DISPOSITIONS[i % ROTATION_DISPOSITIONS.length]}
            />
          ))}
        </div>
      )}
    </main>
  );
}