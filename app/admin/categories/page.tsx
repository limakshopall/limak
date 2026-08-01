// ============================================================
//  ADMIN — IMAGES DES CATÉGORIES  ->  /admin/categories
// ============================================================

import Link from "next/link";
import { prisma } from "../../lib/prisma";
import CategoryImageForm from "./CategoryImageForm";

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <Link
        href="/admin"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
      >
        ← Retour à l'administration
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-[#14213D] dark:text-gray-300">Catégories</h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-gray-400">
        La photo apparaît sur l'accueil et dans le filtre catégorie du catalogue.
      </p>

      <div className="space-y-3">
        {categories.map((c) => (
          <CategoryImageForm key={c.id} categoryId={c.id} name={c.name} imageUrl={c.imageUrl} />
        ))}
      </div>
    </main>
  );
}
