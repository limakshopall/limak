// ============================================================
//  SITEMAP — liste des pages du site pour Google
//  Next.js sert ça automatiquement sur /sitemap.xml
// ============================================================

import type { MetadataRoute } from "next";
import { prisma } from "./lib/prisma";

const BASE_URL = "https://limak-two.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages fixes
  const pagesFixes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/produits`, changeFrequency: "daily", priority: 0.9 },
  ];

  // Une entrée par produit actif
  const produits = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const pagesProduits: MetadataRoute.Sitemap = produits.map((p) => ({
    url: `${BASE_URL}/produits/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...pagesFixes, ...pagesProduits];
}