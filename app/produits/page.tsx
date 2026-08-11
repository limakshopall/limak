// ============================================================
//  PAGE "NOS PRODUITS"  ->  /produits
//  Recherche + filtre catégorie + tri. Cartes réutilisables (ProductCard).
// ============================================================

import type { Metadata } from "next";
import { prisma } from "../lib/prisma";
import ProduitsFiltres from "../components/ProduitsFiltres";
import ProductSection from "../components/ProductSection";
import Reveal from "../components/Reveal";
import { toDisplayItems, epuisesEnDernier, regrouperParFormeImage } from "../lib/displayItems";
import { elargirRecherche } from "../lib/searchSynonymes";

export const metadata: Metadata = {
  title: "Nos articles",
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

  // Élargit la recherche aux synonymes connus (ex: "boubou" -> aussi "bogolan")
  // et cherche dans le nom ET la description, pas juste le nom.
  const termesRecherche = q ? elargirRecherche(q) : [];

  // Indépendantes l'une de l'autre : en parallèle plutôt qu'en série.
  const [produits, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(termesRecherche.length
          ? {
              OR: termesRecherche.flatMap((t) => [
                { name: { contains: t, mode: "insensitive" as const } },
                { description: { contains: t, mode: "insensitive" as const } },
              ]),
            }
          : {}),
        ...(categorie ? { category: { slug: categorie } } : {}),
      },
      include: {
        images: { where: { colorId: null }, orderBy: { position: "asc" }, take: 1 },
        colors: {
          orderBy: { position: "asc" },
          include: { images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true, width: true, height: true } } },
        },
        variants: { select: { colorId: true, price: true, comparePrice: true, stock: true } },
      },
      orderBy,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true, imageUrl: true },
    }),
  ]);

  // Notes moyennes par produit (pour les étoiles sur les cartes) — dépend des ids ci-dessus.
  const ids = produits.map((p) => p.id);
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

  // Une carte par couleur (densité du catalogue) — chacune ouvre la même fiche produit.
  let produitsAffiches = produits.flatMap((produit) =>
    toDisplayItems(produit, notesParProduit.get(produit.id))
  );

  if (tri === "prix-asc") {
    produitsAffiches = [...produitsAffiches].sort((a, b) => a.price - b.price);
  } else if (tri === "prix-desc") {
    produitsAffiches = [...produitsAffiches].sort((a, b) => b.price - a.price);
  }
  // Regroupe par forme de photo proche (portrait/carré/paysage), sans casser
  // le tri choisi ci-dessus au sein de chaque groupe.
  produitsAffiches = regrouperParFormeImage(produitsAffiches);
  // Épuisés en fin de liste (par-dessus le regroupement précédent, donc
  // globalement tout en bas, eux-mêmes regroupés par forme).
  produitsAffiches = epuisesEnDernier(produitsAffiches);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:pb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#14213D] dark:text-gray-300">Nos articles</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-gray-400">
          {produitsAffiches.length} article{produitsAffiches.length > 1 ? "s" : ""} disponible
          {produitsAffiches.length > 1 ? "s" : ""}
        </p>
      </div>

      <ProduitsFiltres categories={categories} />

      {produitsAffiches.length === 0 ? (
        <p className="text-neutral-500 dark:text-gray-400">
          Aucun article ne correspond à votre recherche.
        </p>
      ) : (
        <Reveal>
          <ProductSection produits={produitsAffiches} disposition="grille" />
        </Reveal>
      )}
    </main>
  );
}