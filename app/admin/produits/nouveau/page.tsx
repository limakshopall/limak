// ============================================================
//  ADMIN — AJOUTER UN PRODUIT  ->  /admin/produits/nouveau
// ============================================================

import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import NewProductForm from "./NewProductForm";

export default async function NouveauProduit() {
  // On récupère les catégories pour le menu déroulant
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, imageUrl: true },
  });

  return (
    <main className="mx-auto max-w-2xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <Link
        href="/admin/produits"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
      >
        ← Retour aux articles
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-[#14213D] dark:text-gray-300">Ajouter un article</h1>

      <NewProductForm categories={categories} />
    </main>
  );
}
