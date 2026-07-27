// ============================================================
//  PAGE "NOS PRODUITS"  ->  /produits
//  Chaque carte est maintenant cliquable et mène à la fiche produit.
// ============================================================

import { prisma } from "../lib/prisma";
import Link from "next/link";

export default async function ProduitsPage() {
  const produits = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { orderBy: { price: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Nos produits</h1>

      {produits.length === 0 ? (
        <p className="text-gray-500">Aucun produit pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {produits.map((produit) => {
            const prix = produit.variants[0]?.price ?? 0;
            const stock = produit.variants[0]?.stock ?? 0;
            const image = produit.images[0];

            return (
              // La carte devient un lien vers la fiche du produit.
              <Link
                key={produit.id}
                href={`/produits/${produit.slug}`}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden bg-gray-100 text-xs text-gray-400">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.url}
                      alt={image.alt ?? produit.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "photo à venir"
                  )}
                </div>

                <div className="p-3">
                  <h2 className="truncate text-sm font-medium text-gray-800">
                    {produit.name}
                  </h2>
                  <p className="mt-1 font-semibold text-gray-900">
                    {new Intl.NumberFormat("fr-FR").format(prix)} FCFA
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Stock : {stock}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
