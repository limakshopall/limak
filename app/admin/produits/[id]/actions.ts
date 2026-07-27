// ============================================================
//  ACTIONS ADMIN — modifier / supprimer un produit + images (serveur)
// ============================================================

"use server";

import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id"));
  const variantId = String(formData.get("variantId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const price = parseInt(String(formData.get("price") ?? ""), 10);
  const stock = parseInt(String(formData.get("stock") ?? ""), 10);
  const isActive = formData.get("isActive") === "on";

  if (!id || !name) return;

  await prisma.product.update({
    where: { id },
    data: { name, isActive },
  });

  if (variantId && Number.isFinite(price) && Number.isFinite(stock)) {
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { price, stock },
    });
  }

  redirect("/admin/produits");
}

export async function deleteProduct(id: string) {
  if (!id) return;
  await prisma.product.delete({ where: { id } });
}

// Ajoute une image (téléversée sur UploadThing) au produit.
export async function addProductImage(productId: string, url: string) {
  if (!productId || !url) return;

  // On la place à la fin (position = nombre d'images existantes)
  const count = await prisma.productImage.count({ where: { productId } });

  await prisma.productImage.create({
    data: { productId, url, position: count },
  });
}

// Supprime une image d'un produit.
export async function deleteProductImage(imageId: string) {
  if (!imageId) return;
  await prisma.productImage.delete({ where: { id: imageId } });
}
