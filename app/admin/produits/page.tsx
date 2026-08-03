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
    <main className="mx-auto max-w-5xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <Link
        href="/admin"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
      >
        ← Retour à l&apos;administration
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#14213D] dark:text-gray-300">Articles ({produits.length})</h1>
        <Link
          href="/admin/produits/nouveau"
          className="rounded-full bg-[#F1720A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#C95900]"
        >
          + Ajouter un article
        </Link>
      </div>

      <AdminProduitsFiltres />

      <div className="overflow-x-auto rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <table className="w-full text-sm">
          <thead className="bg-[#14213D]/5 text-left text-neutral-500 dark:bg-white/5 dark:text-gray-400">
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
                <tr key={p.id} className="border-t border-[#14213D]/5 dark:border-white/15">
                  <td className="px-4 py-2 font-medium text-[#14213D] dark:text-gray-300">{p.name}</td>
                  <td className="px-4 py-2 text-neutral-500 dark:text-gray-400">
                    {p.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right text-neutral-700 dark:text-gray-300">
                    {new Intl.NumberFormat("fr-FR").format(v?.price ?? 0)} FCFA
                    {enPromo && (
                      <span className="ml-2 rounded bg-[#F1720A]/15 px-1.5 py-0.5 text-xs font-medium text-[#C95900]">
                        -{Math.round((1 - v!.price / v!.comparePrice!) * 100)}%
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-medium ${
                      stock === 0
                        ? "text-[#D6293E]"
                        : stock <= SEUIL_STOCK_BAS
                          ? "text-[#C95900]"
                          : "text-neutral-700 dark:text-gray-300"
                    }`}
                  >
                    {stock}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {p.isActive ? (
                      <span className="text-[#1F7A5C]" title="Visible">●</span>
                    ) : (
                      <span className="text-neutral-300 dark:text-gray-600" title="Masqué">●</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/admin/produits/${p.id}`}
                      className="font-medium text-[#C95900] hover:underline"
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
