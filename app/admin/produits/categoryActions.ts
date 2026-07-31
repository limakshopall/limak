// ============================================================
//  ACTIONS ADMIN — créer une catégorie à la volée (serveur)
//  Utilisé depuis les formulaires produit (ajout + modification)
//  via CategoryPicker, pour ne pas avoir à quitter la page.
// ============================================================

"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

// Transforme un nom en "slug" (identifiant pour l'URL).
function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // enleve les accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCategory(name: string, imageUrl: string | null) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Le nom de la categorie est requis.");

  let slug = toSlug(trimmed) || "categorie";
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-5)}`;
  }

  const category = await prisma.category.create({
    data: { name: trimmed, slug, imageUrl: imageUrl || null },
  });

  revalidatePath("/admin/produits");
  revalidatePath("/produits");
  revalidatePath("/");

  return { id: category.id, name: category.name, imageUrl: category.imageUrl };
}
