// ============================================================
//  ACTIONS ADMIN — créer un produit (serveur)
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
    .replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .replace(/[^a-z0-9]+/g, "-") // remplace le reste par des tirets
    .replace(/(^-|-$)/g, ""); // enlève les tirets en trop
}

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const price = parseInt(String(formData.get("price") ?? ""), 10);
  const stock = parseInt(String(formData.get("stock") ?? ""), 10);
  const costRaw = String(formData.get("costPrice") ?? "").trim();
  const costPrice = costRaw === "" ? null : parseInt(costRaw, 10);

  if (!name) return;

  // On récupère le vendeur LIMAK (créé lors du seed)
  const vendor = await prisma.vendor.findUnique({ where: { slug: "limak" } });
  if (!vendor) return;

  // On fabrique un slug unique (on ajoute un petit suffixe si besoin)
  let slug = toSlug(name) || "produit";
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-5)}`;
  }

  await prisma.product.create({
    data: {
      name,
      slug,
      description: description || null,
      brand: "LIMAK",
      isActive: true,
      vendorId: vendor.id,
      categoryId: categoryId || null,
      variants: {
        create: [
          {
            name: "Standard",
            price: Number.isFinite(price) ? price : 0,
            stock: Number.isFinite(stock) ? stock : 0,
            costPrice: costPrice != null && Number.isFinite(costPrice) ? costPrice : null,
          },
        ],
      },
    },
  });

  redirect("/admin/produits");
}
