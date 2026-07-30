// ============================================================
//  ROBOTS.TXT — règles pour les moteurs de recherche
//  Next.js sert ça automatiquement sur /robots.txt
// ============================================================

import type { MetadataRoute } from "next";

const BASE_URL = "https://limak-two.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // On empêche l'indexation de l'admin et des pages perso.
      disallow: ["/admin", "/commande", "/panier", "/mes-commandes"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}