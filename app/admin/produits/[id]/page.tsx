// ============================================================
//  ADMIN — MODIFIER UN PRODUIT  ->  /admin/produits/<id>
// ============================================================

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { updateProduct } from "./actions";
import DeleteProductButton from "./DeleteProductButton";
import ProductImageUploader from "./ProductImageUploader";
import ProductImageList from "./ProductImageList";

export default async function EditProduit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const produit = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { price: "asc" }, take: 1 },
      images: { orderBy: { position: "asc" } },
      category: true,
    },
  });

  if (!produit) {
    notFound();
  }

  const variant = produit.variants[0];

  return (
    <main className="mx-auto max-w-xl bg-[#FBEEDA] px-4 py-8">
      <Link
        href="/admin/produits"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-[#14213D]"
      >
        ← Retour aux produits
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-[#14213D]">Modifier le produit</h1>

      <form action={updateProduct} className="space-y-4 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm">
        <input type="hidden" name="id" value={produit.id} />
        {variant && <input type="hidden" name="variantId" value={variant.id} />}

        <div>
          <label className="block text-sm text-neutral-600">Nom</label>
          <input
            name="name"
            defaultValue={produit.name}
            className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-600">Prix (FCFA)</label>
            <input
              name="price"
              type="number"
              defaultValue={variant?.price ?? 0}
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-600">Stock</label>
            <input
              name="stock"
              type="number"
              defaultValue={variant?.stock ?? 0}
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
            />
          </div>
        </div>

        {/* Ancien prix (promo) */}
        <div>
          <label className="block text-sm text-neutral-600">
            Ancien prix / promo (FCFA)
          </label>
          <input
            name="comparePrice"
            type="number"
            defaultValue={variant?.comparePrice ?? ""}
            placeholder="Laisser vide si pas de promo"
            className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
          />
          <p className="mt-1 text-xs text-neutral-400">
            Doit être supérieur au prix pour afficher une réduction. Vide = pas de promo.
          </p>
        </div>

        <label className="flex items-center gap-2">
          <input name="isActive" type="checkbox" defaultChecked={produit.isActive} />
          <span className="text-sm text-neutral-700">
            Produit visible sur la boutique
          </span>
        </label>

        <button
          type="submit"
          className="rounded-full bg-[#F1720A] px-6 py-3 font-semibold text-white transition hover:bg-[#C95900]"
        >
          Enregistrer
        </button>
      </form>

      {/* Images du produit */}
      <div className="mt-6 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-[#14213D]">Images</h2>
        <ProductImageList images={produit.images} />
        <div className="mt-4">
          <ProductImageUploader productId={produit.id} />
        </div>
      </div>

      {/* Suppression du produit */}
      <div className="mt-6 rounded-xl border border-[#D6293E]/20 bg-[#D6293E]/5 p-4">
        <DeleteProductButton id={produit.id} />
      </div>
    </main>
  );
}