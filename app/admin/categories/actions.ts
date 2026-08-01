// ============================================================
//  ACTIONS ADMIN — image d'une catégorie (serveur)
// ============================================================

"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCategoryImage(categoryId: string, url: string) {
  if (!categoryId || !url) return;

  await prisma.category.update({
    where: { id: categoryId },
    data: { imageUrl: url },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/produits");
  revalidatePath("/");
}
