// ============================================================
//  ADMIN — LISTE DES PRODUITS  ->  /admin/produits
// ============================================================

import Link from "next/link";
import { prisma } from "../../lib/prisma";
import AdminProduitsFiltres from "./AdminProduitsFiltres";

// Seuil en dessous duquel le stock est signalé (même seuil que le dashboard admin).
const SEUIL_STOCK_BAS = 3;

export default async function AdminProduits({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tri?: string }>;
}) {
  const { q, tri = "nom" } = await searchParams;

  const produits = await prisma.product.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    include: {
      category: true,
      variants: { orderBy: { price: "asc" }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  // Tri sur le prix/stock : appliqué en mémoire (dépend de la variante la moins chère).
  const produitsTries = [...produits].sort((a, b) => {
    const va = a.variants[0];
    const vb = b.variants[0];
    if (tri === "stock-asc") return (va?.stock ?? 0) - (vb?.stock ?? 0);
    if (tri === "prix-asc") return (va?.price ?? 0) - (vb?.price ?? 0);
    if (tri === "prix-desc") return (vb?.price ?? 0) - (va?.price ?? 0);
    return a.name.localeCompare(b.name);
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

      <AdminProduitsFiltres />

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
            {produitsTries.map((p) => {
              const v = p.variants[0];
              const enPromo = v?.comparePrice != null && v.comparePrice > v.price;
              const stock = v?.stock ?? 0;
              return (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {p.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {new Intl.NumberFormat("fr-FR").format(v?.price ?? 0)} FCFA
                    {enPromo && (
                      <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">
                        -{Math.round((1 - v!.price / v!.comparePrice!) * 100)}%
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-medium ${
                      stock === 0
                        ? "text-red-600"
                        : stock <= SEUIL_STOCK_BAS
                          ? "text-orange-600"
                          : "text-gray-700"
                    }`}
                  >
                    {stock}
                  </td>
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
