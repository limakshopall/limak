// ============================================================
//  ACTIONS ADMIN — modifier / supprimer un produit, ses couleurs,
//  tailles, variantes (prix/stock) et images (serveur)
// ============================================================

"use server";

import { prisma } from "../../../lib/prisma";
import { notifierRetourEnStock } from "../../../lib/stockAlerts";
import { Prisma } from "../../../generated/prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
  const description = String(formData.get("description") ?? "").trim();
  const isActive = formData.get("isActive") === "on";
  const categoryId = String(formData.get("categoryId") ?? "");

  if (!id || !name) return;

  await prisma.product.update({
    where: { id },
    data: { name, description: description || null, isActive, categoryId: categoryId || null },
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

function resolveCostPrice(costRaw: string): number | null {
  const trimmed = costRaw.trim();
  if (trimmed === "") return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

// ============================================================
//  SYNCHRONISATION DES VARIANTES
//  À chaque ajout/suppression de couleur ou de taille, on recalcule
//  la liste des combinaisons possibles et on ajuste les variantes :
//  - combinaison manquante -> créée (prix/stock à 0, à remplir)
//  - combinaison disparue -> supprimée (si jamais commandée, ignorée)
//  Cas particulier : passer de 1 seule variante "standard" à la toute
//  première couleur/taille réutilise cette variante (garde son prix/stock)
//  plutôt que d'en recréer une à 0.
// ============================================================
async function syncVariantCombos(productId: string) {
  const [colors, sizes, existing] = await Promise.all([
    prisma.productColor.findMany({ where: { productId }, orderBy: { position: "asc" } }),
    prisma.productSize.findMany({ where: { productId }, orderBy: { position: "asc" } }),
    prisma.productVariant.findMany({ where: { productId } }),
  ]);

  const desired: { colorId: string | null; sizeId: string | null }[] = [];
  if (colors.length > 0 && sizes.length > 0) {
    for (const c of colors) for (const s of sizes) desired.push({ colorId: c.id, sizeId: s.id });
  } else if (colors.length > 0) {
    for (const c of colors) desired.push({ colorId: c.id, sizeId: null });
  } else if (sizes.length > 0) {
    for (const s of sizes) desired.push({ colorId: null, sizeId: s.id });
  } else {
    desired.push({ colorId: null, sizeId: null });
  }

  const key = (c: string | null, s: string | null) => `${c ?? ""}|${s ?? ""}`;
  const existingKeys = new Set(existing.map((v) => key(v.colorId, v.sizeId)));
  const desiredKeys = new Set(desired.map((d) => key(d.colorId, d.sizeId)));

  const toCreate = desired.filter((d) => !existingKeys.has(key(d.colorId, d.sizeId)));
  const toDelete = existing.filter((v) => !desiredKeys.has(key(v.colorId, v.sizeId)));

  // Transition "1 variante standard -> 1re combinaison" : on réutilise la ligne,
  // pour ne pas perdre le prix/stock déjà saisi.
  if (existing.length === 1 && toCreate.length === 1 && toDelete.length === 1) {
    await prisma.productVariant.update({
      where: { id: existing[0].id },
      data: { colorId: toCreate[0].colorId, sizeId: toCreate[0].sizeId },
    });
    return;
  }

  if (toCreate.length > 0) {
    await prisma.productVariant.createMany({
      data: toCreate.map((d) => ({
        productId,
        colorId: d.colorId,
        sizeId: d.sizeId,
        name: "Standard",
        price: 0,
        stock: 0,
      })),
    });
  }

  for (const v of toDelete) {
    // Best-effort : une variante déjà commandée ne peut pas être supprimée (FK), on l'ignore.
    await prisma.productVariant.delete({ where: { id: v.id } }).catch(() => {});
  }
}

// ============================================================
//  COULEURS
// ============================================================

export async function createColor(productId: string, name: string, hex: string | null) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Le nom de la couleur est requis.");

  const count = await prisma.productColor.count({ where: { productId } });
  const color = await prisma.productColor.create({
    data: { productId, name: trimmed, hex: hex || null, position: count },
  });

  await syncVariantCombos(productId);
  revalidatePath(`/admin/produits/${productId}`);
  return color;
}

export async function deleteColor(
  colorId: string,
  productId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!colorId) return { ok: false, error: "Couleur introuvable." };

  try {
    // Les images de cette couleur partent avec elle (Cascade).
    await prisma.productColor.delete({ where: { id: colorId } });
    await syncVariantCombos(productId);
    revalidatePath(`/admin/produits/${productId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Impossible de supprimer cette couleur." };
  }
}

// ============================================================
//  TAILLES
// ============================================================

export async function createSize(productId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Le nom de la taille est requis.");

  const count = await prisma.productSize.count({ where: { productId } });
  const size = await prisma.productSize.create({
    data: { productId, name: trimmed, position: count },
  });

  await syncVariantCombos(productId);
  revalidatePath(`/admin/produits/${productId}`);
  return size;
}

export async function deleteSize(
  sizeId: string,
  productId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!sizeId) return { ok: false, error: "Taille introuvable." };

  try {
    await prisma.productSize.delete({ where: { id: sizeId } });
    await syncVariantCombos(productId);
    revalidatePath(`/admin/produits/${productId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Impossible de supprimer cette taille." };
  }
}

// ============================================================
//  VARIANTES — prix/stock d'une combinaison (couleur/taille fixées
//  par la synchronisation ci-dessus, non modifiables ici)
// ============================================================

export async function updateVariantPricing(formData: FormData) {
  const variantId = String(formData.get("variantId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const price = parseInt(String(formData.get("price") ?? ""), 10);
  const stock = parseInt(String(formData.get("stock") ?? ""), 10);
  const compareRaw = String(formData.get("comparePrice") ?? "");
  const costRaw = String(formData.get("costPrice") ?? "");

  if (!variantId || !Number.isFinite(price) || !Number.isFinite(stock)) return;

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      price,
      stock,
      comparePrice: resolveComparePrice(compareRaw, price),
      costPrice: resolveCostPrice(costRaw),
    },
  });

  revalidatePath(`/admin/produits/${productId}`);

  // Best-effort, après coup : prévient les clients en attente si ce
  // produit/cette couleur repasse en stock.
  await notifierRetourEnStock(variant.productId, variant.colorId);
}

// Applique le même prix/promo/prix fournisseur à TOUTES les variantes du
// produit d'un coup (utile pour un article décliné en tailles/couleurs qui
// doit garder un prix uniforme). Le stock n'est pas touché — il reste propre
// à chaque variante. On peut toujours modifier une variante individuellement
// après coup, ce formulaire ne fait qu'un réglage groupé initial.
export async function updateAllVariantsPricing(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const price = parseInt(String(formData.get("price") ?? ""), 10);
  const compareRaw = String(formData.get("comparePrice") ?? "");
  const costRaw = String(formData.get("costPrice") ?? "");

  if (!productId || !Number.isFinite(price)) return;

  await prisma.productVariant.updateMany({
    where: { productId },
    data: {
      price,
      comparePrice: resolveComparePrice(compareRaw, price),
      costPrice: resolveCostPrice(costRaw),
    },
  });

  revalidatePath(`/admin/produits/${productId}`);
}

export async function deleteProduct(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  if (!id) return { ok: false, error: "Article introuvable." };

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
        error: "Impossible de supprimer : cet article a déjà été commandé. Désactive-le plutôt.",
      };
    }
    throw err;
  }
}

// Ajoute une image (téléversée sur UploadThing) au produit, éventuellement
// rattachée à une couleur (colorId) et/ou une taille (sizeId) précise.
export async function addProductImage(
  productId: string,
  url: string,
  colorId?: string | null,
  sizeId?: string | null,
  width?: number | null,
  height?: number | null
) {
  if (!productId || !url) return;

  const count = await prisma.productImage.count({
    where: { productId, colorId: colorId ?? null, sizeId: sizeId ?? null },
  });

  await prisma.productImage.create({
    data: {
      productId,
      url,
      position: count,
      colorId: colorId ?? null,
      sizeId: sizeId ?? null,
      width: width ?? null,
      height: height ?? null,
    },
  });

  revalidatePath(`/admin/produits/${productId}`);
}

// Change le numéro d'ordre d'une image (1 = photo principale, affichée en
// premier sur la fiche produit et les cartes). Les autres numéros ne sont
// pas recalculés : en cas d'égalité, l'ordre entre elles n'est pas garanti.
export async function updateImagePosition(imageId: string, position: number) {
  if (!imageId || !Number.isFinite(position) || position < 1) return;

  const image = await prisma.productImage.update({
    where: { id: imageId },
    data: { position: Math.floor(position) - 1 },
  });

  revalidatePath(`/admin/produits/${image.productId}`);
}

// Réordonne un groupe de photos après un glisser-déposer : imageIds est le
// nouvel ordre complet, on renumérote 0,1,2... en conséquence.
export async function reorderProductImages(productId: string, imageIds: string[]) {
  if (!imageIds || imageIds.length === 0) return;

  await prisma.$transaction(
    imageIds.map((id, i) => prisma.productImage.update({ where: { id }, data: { position: i } }))
  );

  revalidatePath(`/admin/produits/${productId}`);
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

  if (image) revalidatePath(`/admin/produits/${image.productId}`);
}
