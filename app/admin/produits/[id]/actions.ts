// ============================================================
//  ACTIONS ADMIN — modifier / supprimer un produit + images (serveur)
// ============================================================

"use server";

import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { redirect } from "next/navigation";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// Le fichier UploadThing est identifié par la fin de l'URL (ex: .../f/<key>).
function extractFileKey(url: string): string | null {
  const key = url.split("/").pop();
  return key || null;
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const isActive = formData.get("isActive") === "on";
  const categoryId = String(formData.get("categoryId") ?? "");

  if (!id || !name) return;

  await prisma.product.update({
    where: { id },
    data: { name, isActive, categoryId: categoryId || null },
  });

  redirect("/admin/produits");
}

// La promo n'a de sens que si l'ancien prix est strictement supérieur au nouveau.
function resolveComparePrice(compareRaw: string, price: number): number | null {
  const trimmed = compareRaw.trim();
  if (trimmed === "") return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed > price ? parsed : null;
}

// Ajoute une variante (couleur/taille) à un produit.
function resolveCostPrice(costRaw: string): number | null {
  const trimmed = costRaw.trim();
  if (trimmed === "") return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function createVariant(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const color = String(formData.get("color") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const price = parseInt(String(formData.get("price") ?? ""), 10);
  const stock = parseInt(String(formData.get("stock") ?? ""), 10);
  const compareRaw = String(formData.get("comparePrice") ?? "");
  const costRaw = String(formData.get("costPrice") ?? "");

  if (!productId || !Number.isFinite(price) || !Number.isFinite(stock)) return;

  const name = [color, size].filter(Boolean).join(" / ") || "Standard";

  await prisma.productVariant.create({
    data: {
      productId,
      name,
      color: color || null,
      size: size || null,
      price,
      stock,
      comparePrice: resolveComparePrice(compareRaw, price),
      costPrice: resolveCostPrice(costRaw),
    },
  });

  redirect(`/admin/produits/${productId}`);
}

// Modifie une variante existante.
export async function updateVariant(formData: FormData) {
  const variantId = String(formData.get("variantId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const color = String(formData.get("color") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const price = parseInt(String(formData.get("price") ?? ""), 10);
  const stock = parseInt(String(formData.get("stock") ?? ""), 10);
  const compareRaw = String(formData.get("comparePrice") ?? "");
  const costRaw = String(formData.get("costPrice") ?? "");

  if (!variantId || !Number.isFinite(price) || !Number.isFinite(stock)) return;

  const name = [color, size].filter(Boolean).join(" / ") || "Standard";

  await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      name,
      color: color || null,
      size: size || null,
      price,
      stock,
      comparePrice: resolveComparePrice(compareRaw, price),
      costPrice: resolveCostPrice(costRaw),
    },
  });

  redirect(`/admin/produits/${productId}`);
}

// Supprime une variante (impossible si c'est la dernière du produit).
export async function deleteVariant(
  variantId: string,
  productId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!variantId) return { ok: false, error: "Variante introuvable." };

  const total = await prisma.productVariant.count({ where: { productId } });
  if (total <= 1) {
    return { ok: false, error: "Impossible de supprimer la seule variante du produit." };
  }

  try {
    await prisma.productVariant.delete({ where: { id: variantId } });
    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return {
        ok: false,
        error: "Impossible de supprimer : cette variante a déjà été commandée.",
      };
    }
    throw err;
  }
}

export async function deleteProduct(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (!id) return { ok: false, error: "Produit introuvable." };

  try {
    // Récupère les images pour les supprimer aussi côté UploadThing.
    const images = await prisma.productImage.findMany({ where: { productId: id } });

    await prisma.product.delete({ where: { id } });

    const keys = images.map((img) => extractFileKey(img.url)).filter((k): k is string => !!k);
    if (keys.length > 0) {
      // Best-effort : un échec de suppression UploadThing ne doit pas remonter à l'admin.
      await utapi.deleteFiles(keys).catch(() => {});
    }

    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return {
        ok: false,
        error: "Impossible de supprimer : ce produit a déjà été commandé. Désactive-le plutôt.",
      };
    }
    throw err;
  }
}

// Ajoute une image (téléversée sur UploadThing) au produit.
export async function addProductImage(productId: string, url: string) {
  if (!productId || !url) return;

  const count = await prisma.productImage.count({ where: { productId } });

  await prisma.productImage.create({
    data: { productId, url, position: count },
  });
}

// Supprime une image d'un produit (base + fichier UploadThing).
export async function deleteProductImage(imageId: string) {
  if (!imageId) return;

  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  await prisma.productImage.delete({ where: { id: imageId } });

  const key = image ? extractFileKey(image.url) : null;
  if (key) {
    await utapi.deleteFiles(key).catch(() => {});
  }
}