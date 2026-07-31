// ============================================================
//  ADMIN — AJOUTER UN PRODUIT  ->  /admin/produits/nouveau
// ============================================================

import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { createProduct } from "./actions";
import CategoryPicker from "../CategoryPicker";

export default async function NouveauProduit() {
  // On récupère les catégories pour le menu déroulant
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, imageUrl: true },
  });

  return (
    <main className="mx-auto max-w-xl bg-[#FBEEDA] px-4 py-8">
      <Link
        href="/admin/produits"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-[#14213D]"
      >
        ← Retour aux produits
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-[#14213D]">Ajouter un produit</h1>

      <form action={createProduct} className="space-y-4 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm">
        <div>
          <label className="block text-sm text-neutral-600">Nom</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
          />
        </div>

        <CategoryPicker categories={categories} />

        <div>
          <label className="block text-sm text-neutral-600">
            Description (facultatif)
          </label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-600">Prix (FCFA)</label>
            <input
              name="price"
              type="number"
              defaultValue={0}
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-600">Stock</label>
            <input
              name="stock"
              type="number"
              defaultValue={0}
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
            />
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-[#14213D]/20 bg-[#FBEEDA] p-3">
          <label className="block text-sm text-neutral-600">
            Prix fournisseur (FCFA)
          </label>
          <input
            name="costPrice"
            type="number"
            placeholder="Facultatif"
            className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
          />
          <p className="mt-1 text-xs text-neutral-400">
            Usage interne uniquement — jamais visible par les clients.
          </p>
        </div>

        <button
          type="submit"
          className="rounded-full bg-[#F1720A] px-6 py-3 font-semibold text-white transition hover:bg-[#C95900]"
        >
          Créer le produit
        </button>
      </form>

      <p className="mt-4 text-xs text-neutral-400">
        Les photos pourront être ajoutées ensuite (étape dédiée aux images).
      </p>
    </main>
  );
}
