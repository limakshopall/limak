// ============================================================
//  MANIFEST — permet d'installer LIMAK sur l'écran d'accueil
//  Next.js le sert automatiquement sur /manifest.webmanifest
// ============================================================

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LIMAK — Boutique en ligne",
    short_name: "LIMAK",
    description: "Votre boutique en ligne en Côte d'Ivoire. Paiement à la livraison.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff", // fond blanc du splash (fond de icon-192.png)
    theme_color: "#14213D",      // couleur de la barre du navigateur (indigo nuit, identité actuelle)
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}