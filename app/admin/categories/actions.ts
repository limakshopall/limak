// ============================================================
//  ACTIONS ADMIN — image d'une catégorie (serveur)
// ============================================================

"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

// Fabrique un slug simple à partir d'un nom (sans accents, en minuscules).
function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function revalider() {
  revalidatePath("/admin/categories");
  revalidatePath("/produits");
  revalidatePath("/");
}

export async function updateCategoryImage(categoryId: string, url: string) {
  if (!categoryId || !url) return;

  await prisma.category.update({
    where: { id: categoryId },
    data: { imageUrl: url },
  });

  revalider();
}

// Modifie le nom et/ou la catégorie parente (le slug ne change pas, pour ne pas
// casser les liens existants /produits?categorie=...).
export async function updateCategory(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "");

  if (!id || !name) return;
  if (parentId === id) return; // une catégorie ne peut pas être son propre parent

  await prisma.category.update({
    where: { id },
    data: { name, parentId: parentId || null },
  });

  revalider();
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "");
  if (!name) return;

  const baseSlug = slugify(name) || "categorie";
  let slug = baseSlug;
  let n = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }

  await prisma.category.create({
    data: { name, slug, parentId: parentId || null },
  });

  revalider();
}

export async function deleteCategory(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (!id) return { ok: false, error: "Catégorie introuvable." };

  // Les produits/sous-catégories liés ne sont pas supprimés : ils perdent
  // juste leur catégorie (onDelete: SetNull dans le schéma).
  await prisma.category.delete({ where: { id } });
  revalider();
  return { ok: true };
}
