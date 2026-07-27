// ============================================================
//  ADMIN — LISTE DES PRODUITS  ->  /admin/produits
// ============================================================

import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function AdminProduits() {
  const produits = await prisma.product.findMany({
    include: {
      category: true,
      variants: { orderBy: { price: "asc" }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/admin"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-800"
      >
        ← Retour à l'administration
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produits ({produits.length})</h1>
        <Link
          href="/admin/produits/nouveau"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Ajouter un produit
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Catégorie</th>
              <th className="px-4 py-2 text-right">Prix</th>
              <th className="px-4 py-2 text-right">Stock</th>
              <th className="px-4 py-2 text-center">Actif</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {produits.map((p) => {
              const v = p.variants[0];
              return (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {p.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {new Intl.NumberFormat("fr-FR").format(v?.price ?? 0)} FCFA
                  </td>
                  <td className="px-4 py-2 text-right">{v?.stock ?? 0}</td>
                  <td className="px-4 py-2 text-center">
                    {p.isActive ? (
                      <span className="text-green-600" title="Visible">●</span>
                    ) : (
                      <span className="text-gray-300" title="Masqué">●</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/admin/produits/${p.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
