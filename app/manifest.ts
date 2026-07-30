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
    display: "standalone", // s'ouvre en plein écran, comme une appli
    background_color: "#0f1724",
    theme_color: "#0f1724",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}