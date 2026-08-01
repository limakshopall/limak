import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Formats modernes (plus légers) servis automatiquement
    formats: ["image/avif", "image/webp"],
    // Next 16 limite par défaut à 75 (images floues) — on autorise une meilleure qualité.
    qualities: [75, 90, 100],
    // Domaines d'images distantes autorisés (UploadThing)
    remotePatterns: [
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
};

export default nextConfig;
