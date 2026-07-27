// ============================================================
//  FICHE PRODUIT  ->  /produits/<slug>
//  Server Component : lit la base. Galerie + bouton = Client Components.
// ============================================================

import { prisma } from "../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "./ProductGallery";
import AddToCartButton from "./AddToCartButton";

export default async function FicheProduit({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const produit = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { price: "asc" } },
      category: true,
    },
  });

  if (!produit) {
    notFound();
  }

  const prix = produit.variants[0]?.price ?? 0;
  const stock = produit.variants[0]?.stock ?? 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/produits"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-800"
      >
        ← Retour aux produits
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Galerie interactive */}
        <ProductGallery images={produit.images} name={produit.name} />

        {/* Informations produit */}
        <div>
          {produit.category && (
            <p className="text-sm text-gray-500">{produit.category.name}</p>
          )}
          <h1 className="mt-1 text-2xl font-bold">{produit.name}</h1>

          <p className="mt-4 text-3xl font-semibold">
            {new Intl.NumberFormat("fr-FR").format(prix)} FCFA
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {stock > 0 ? `En stock (${stock} disponibles)` : "Rupture de stock"}
          </p>

          {produit.description && (
            <p className="mt-6 leading-relaxed text-gray-700">
              {produit.description}
            </p>
          )}

          {/* Bouton fonctionnel : ajoute le produit au panier */}
          <AddToCartButton
            productId={produit.id}
            slug={produit.slug}
            name={produit.name}
            price={prix}
            image={produit.images[0]?.url ?? null}
            stock={stock}
          />
        </div>
      </div>
    </main>
  );
}
