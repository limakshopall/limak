// ============================================================
//  ADMIN — IMAGES DES CATÉGORIES  ->  /admin/categories
// ============================================================

import Link from "next/link";
import { prisma } from "../../lib/prisma";
import CategoryImageForm from "./CategoryImageForm";
import CategoryEditForm from "./CategoryEditForm";
import AddCategoryForm from "./AddCategoryForm";

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
        ← Retour à l&apos;administration
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-[#14213D] dark:text-gray-300">Catégories</h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-gray-400">
        La photo apparaît sur l&apos;accueil et dans le filtre catégorie du catalogue.
        Le nom peut être modifié sans casser les liens existants.
      </p>

      <div className="space-y-3">
        {categories.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]"
          >
            <CategoryImageForm categoryId={c.id} name={c.name} imageUrl={c.imageUrl} />
            <div className="mt-3 border-t border-[#14213D]/10 pt-3 dark:border-white/15">
              <CategoryEditForm
                id={c.id}
                name={c.name}
                parentId={c.parentId}
                options={categories.filter((o) => o.id !== c.id)}
              />
            </div>
          </div>
        ))}
      </div>

      <AddCategoryForm options={categories} />
    </main>
  );
}
