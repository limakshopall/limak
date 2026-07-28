import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Formats modernes (plus légers) servis automatiquement
    formats: ["image/avif", "image/webp"],
    // Domaines d'images distantes autorisés (UploadThing)
    remotePatterns: [
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
};

export default nextConfig;
