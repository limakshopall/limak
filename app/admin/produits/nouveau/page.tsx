// ============================================================
//  ADMIN — AJOUTER UN PRODUIT  ->  /admin/produits/nouveau
// ============================================================

import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { createProduct } from "./actions";

export default async function NouveauProduit() {
  // On récupère les catégories pour le menu déroulant
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <Link
        href="/admin/produits"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-800"
      >
        ← Retour aux produits
      </Link>

      <h1 className="mb-8 text-2xl font-bold">Ajouter un produit</h1>

      <form action={createProduct} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600">Nom</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Catégorie</label>
          <select
            name="categoryId"
            defaultValue=""
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="">— Aucune —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600">
            Description (facultatif)
          </label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Prix (FCFA)</label>
            <input
              name="price"
              type="number"
              defaultValue={0}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Stock</label>
            <input
              name="stock"
              type="number"
              defaultValue={0}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
        >
          Créer le produit
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-400">
        Les photos pourront être ajoutées ensuite (étape dédiée aux images).
      </p>
    </main>
  );
}
