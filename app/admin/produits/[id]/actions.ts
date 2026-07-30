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

  // Ancien prix (promo) : vide -> null (pas de promo)
  const compareRaw = String(formData.get("comparePrice") ?? "").trim();
  const comparePrice = compareRaw === "" ? null : parseInt(compareRaw, 10);

  if (!id || !name) return;

  await prisma.product.update({
    where: { id },
    data: { name, isActive },
  });

  if (variantId && Number.isFinite(price) && Number.isFinite(stock)) {
    await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        price,
        stock,
        // On enregistre la promo seulement si c'est un nombre valide ; sinon on efface.
        comparePrice:
          comparePrice !== null && Number.isFinite(comparePrice) ? comparePrice : null,
      },
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