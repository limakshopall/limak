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
import VariantList from "./VariantList";
import ColorManager from "./ColorManager";
import SizeManager from "./SizeManager";
import CategoryPicker from "../CategoryPicker";

export default async function EditProduit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const produit = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        include: { color: { select: { name: true } }, size: { select: { name: true } } },
        orderBy: [{ colorId: "asc" }, { sizeId: "asc" }],
      },
      colors: {
        orderBy: { position: "asc" },
        include: { images: { orderBy: { position: "asc" }, select: { id: true, url: true } } },
      },
      sizes: {
        orderBy: { position: "asc" },
        include: { images: { orderBy: { position: "asc" }, select: { id: true, url: true } } },
      },
      // Photos générales du produit (non rattachées à une couleur ou taille précise).
      images: { where: { colorId: null, sizeId: null }, orderBy: { position: "asc" } },
      category: true,
    },
  });

  if (!produit) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, imageUrl: true },
  });

  return (
    <main className="mx-auto max-w-xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <Link
        href="/admin/produits"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
      >
        ← Retour aux articles
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-[#14213D] dark:text-gray-300">Modifier l&apos;article</h1>

      <form action={updateProduct} className="space-y-4 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <input type="hidden" name="id" value={produit.id} />

        <div>
          <label className="block text-sm text-neutral-600 dark:text-gray-400">Nom</label>
          <input
            name="name"
            defaultValue={produit.name}
            className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
          />
        </div>

        <CategoryPicker categories={categories} defaultValue={produit.categoryId ?? ""} />

        <label className="flex items-center gap-2">
          <input name="isActive" type="checkbox" defaultChecked={produit.isActive} />
          <span className="text-sm text-neutral-700 dark:text-gray-300">
            Article visible sur la boutique
          </span>
        </label>

        <button
          type="submit"
          className="rounded-full bg-[#F1720A] px-6 py-3 font-semibold text-white transition hover:bg-[#C95900]"
        >
          Enregistrer
        </button>
      </form>

      {/* Couleurs (facultatif) */}
      <div className="mt-6 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <h2 className="mb-1 font-semibold text-[#14213D] dark:text-gray-300">Couleurs</h2>
        <p className="mb-3 text-xs text-neutral-500 dark:text-gray-400">
          Chaque couleur peut avoir ses propres photos, affichées quand le client la sélectionne.
        </p>
        <ColorManager productId={produit.id} colors={produit.colors} />
      </div>

      {/* Tailles (facultatif) */}
      <div className="mt-6 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <h2 className="mb-1 font-semibold text-[#14213D] dark:text-gray-300">Tailles</h2>
        <p className="mb-3 text-xs text-neutral-500 dark:text-gray-400">
          ex: S, M, L, XL ou 38, 39, 40… ou une contenance (250ml). Chaque taille peut aussi avoir
          ses propres photos.
        </p>
        <SizeManager productId={produit.id} sizes={produit.sizes} />
      </div>

      {/* Variantes : prix + stock par combinaison couleur/taille */}
      <div className="mt-6 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <h2 className="mb-1 font-semibold text-[#14213D] dark:text-gray-300">Variantes / Stock</h2>
        <p className="mb-3 text-xs text-neutral-500 dark:text-gray-400">
          Généré automatiquement à partir des couleurs et tailles ci-dessus. Remplis le prix et le
          stock de chaque combinaison.
        </p>
        <VariantList productId={produit.id} variants={produit.variants} />
      </div>

      {/* Photos générales du produit (sans couleur précise) */}
      <div className="mt-6 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <h2 className="mb-1 font-semibold text-[#14213D] dark:text-gray-300">Photos générales</h2>
        <p className="mb-3 text-xs text-neutral-500 dark:text-gray-400">
          {produit.colors.length > 0
            ? "Utilisées si aucune photo n'est définie pour la couleur sélectionnée."
            : "Photos de l'article."}
        </p>
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