// ============================================================
//  UPLOADTHING — définition des règles de téléversement
//  "imageUploader" (1 image, 4 Mo max) et "videoUploader"
//  (1 vidéo, 32 Mo max, pour le carrousel d'accueil).
//  Réservées à l'admin connecté.
// ============================================================

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { cookies } from "next/headers";

const f = createUploadthing();

// Seul l'admin connecté peut téléverser.
async function verifierAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("limak_admin")?.value;
  if (token !== process.env.ADMIN_SESSION_TOKEN) {
    throw new UploadThingError("Non autorisé");
  }
  return { admin: true };
}

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(verifierAdmin)
    .onUploadComplete(async ({ file }) => {
      // Après l'envoi, on renvoie l'adresse de l'image au navigateur.
      return { url: file.ufsUrl };
    }),

  videoUploader: f({
    video: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(verifierAdmin)
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
