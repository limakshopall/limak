// ============================================================
//  FICHE PRODUIT  ->  /produits/<slug>
//  Server Component : lit la base. Galerie + bouton + avis = Client Components.
// ============================================================

import { prisma } from "../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ProductGallery from "./ProductGallery";
import AddToCartButton from "./AddToCartButton";
import ReviewForm from "./ReviewForm";

// Petit affichage d'étoiles (non interactif) pour une note donnée.
function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span aria-label={`${value.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? "text-orange-500" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

// Métadonnées dynamiques : titre + aperçu de partage propres à chaque produit.
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
    return { title: "Produit introuvable" };
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
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!produit) {
    notFound();
  }

  const prix = produit.variants[0]?.price ?? 0;
  const stock = produit.variants[0]?.stock ?? 0;

  const avis = produit.reviews;
  const nbAvis = avis.length;
  const moyenne = nbAvis ? avis.reduce((s, a) => s + a.rating, 0) / nbAvis : 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/produits"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-800"
      >
        ← Retour aux produits
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={produit.images} name={produit.name} />

        <div>
          {produit.category && (
            <p className="text-sm text-gray-500">{produit.category.name}</p>
          )}
          <h1 className="mt-1 text-2xl font-bold">{produit.name}</h1>

          {nbAvis > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Stars value={moyenne} />
              <span className="text-gray-600">
                {moyenne.toFixed(1)} · {nbAvis} avis
              </span>
            </div>
          )}

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

      {/* --- SECTION AVIS CLIENTS --- */}
      <section className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-xl font-bold">
          Avis clients{nbAvis > 0 && ` (${nbAvis})`}
        </h2>

        <ReviewForm productId={produit.id} slug={produit.slug} />

        <div className="mt-8 space-y-6">
          {nbAvis === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun avis pour le moment. Soyez le premier à en laisser un !
            </p>
          ) : (
            avis.map((a) => (
              <div key={a.id} className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {a.authorName}
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      ✓ Achat vérifié
                    </span>
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="mt-1 text-sm">
                  <Stars value={a.rating} />
                </div>
                {a.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    {a.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}