// ============================================================
//  ACTION ADMIN — créer un produit complet (serveur)
//  Couleurs, tailles et leurs photos sont montées côté client
//  (aucun productId requis pour l'upload UploadThing) puis tout
//  est envoyé ici en un seul appel, créé dans une transaction.
// ============================================================

"use server";

import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";

// Transforme un nom en "slug" (identifiant pour l'URL) :
// "Sac à Main Doré" -> "sac-a-main-dore"
function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // enlève les accents
    .replace(/[^a-z0-9]+/g, "-") // remplace le reste par des tirets
    .replace(/(^-|-$)/g, ""); // enlève les tirets en trop
}

export type NewColorInput = { name: string; hex: string | null; images: string[] };
export type NewSizeInput = { name: string; images: string[] };
export type NewVariantInput = {
  colorIndex: number | null;
  sizeIndex: number | null;
  price: number;
  stock: number;
  comparePrice: number | null;
  costPrice: number | null;
};

export type CreateProductInput = {
  name: string;
  categoryId: string | null;
  description: string | null;
  images: string[]; // photos générales (sans couleur précise)
  colors: NewColorInput[];
  sizes: NewSizeInput[];
  // Utilisées seulement si colors et sizes sont vides
  basePrice: number;
  baseStock: number;
  baseComparePrice: number | null;
  baseCostPrice: number | null;
  // Utilisées si colors et/ou sizes existent (une entrée par combinaison)
  variants: NewVariantInput[];
};

export async function createProduct(input: CreateProductInput) {
  const name = input.name.trim();
  if (!name) throw new Error("Le nom est requis.");

  const vendor = await prisma.vendor.findUnique({ where: { slug: "limak" } });
  if (!vendor) throw new Error("Vendeur introuvable.");

  // On fabrique un slug unique (on ajoute un petit suffixe si besoin)
  let slug = toSlug(name) || "produit";
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-5)}`;
  }

  const hasVariants = input.colors.length > 0 || input.sizes.length > 0;

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name,
        slug,
        description: input.description || null,
        brand: "LIMAK",
        isActive: true,
        vendorId: vendor.id,
        categoryId: input.categoryId || null,
      },
    });

    for (const [i, url] of input.images.entries()) {
      await tx.productImage.create({ data: { productId: created.id, url, position: i } });
    }

    const colorIds: string[] = [];
    for (const [i, c] of input.colors.entries()) {
      const colorName = c.name.trim();
      if (!colorName) continue;
      const color = await tx.productColor.create({
        data: { productId: created.id, name: colorName, hex: c.hex || null, position: i },
      });
      colorIds[i] = color.id;
      for (const [j, url] of c.images.entries()) {
        await tx.productImage.create({
          data: { productId: created.id, colorId: color.id, url, position: j },
        });
      }
    }

    const sizeIds: string[] = [];
    for (const [i, s] of input.sizes.entries()) {
      const sizeName = s.name.trim();
      if (!sizeName) continue;
      const size = await tx.productSize.create({
        data: { productId: created.id, name: sizeName, position: i },
      });
      sizeIds[i] = size.id;
      for (const [j, url] of s.images.entries()) {
        await tx.productImage.create({
          data: { productId: created.id, sizeId: size.id, url, position: j },
        });
      }
    }

    if (hasVariants) {
      for (const v of input.variants) {
        await tx.productVariant.create({
          data: {
            productId: created.id,
            colorId: v.colorIndex != null ? (colorIds[v.colorIndex] ?? null) : null,
            sizeId: v.sizeIndex != null ? (sizeIds[v.sizeIndex] ?? null) : null,
            name: "Standard",
            price: Number.isFinite(v.price) ? v.price : 0,
            stock: Number.isFinite(v.stock) ? v.stock : 0,
            comparePrice: v.comparePrice,
            costPrice: v.costPrice,
          },
        });
      }
    } else {
      await tx.productVariant.create({
        data: {
          productId: created.id,
          name: "Standard",
          price: Number.isFinite(input.basePrice) ? input.basePrice : 0,
          stock: Number.isFinite(input.baseStock) ? input.baseStock : 0,
          comparePrice: input.baseComparePrice,
          costPrice: input.baseCostPrice,
        },
      });
    }

    return created;
  });

  redirect("/admin/produits");
  return product;
}
