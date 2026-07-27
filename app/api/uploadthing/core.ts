// ============================================================
//  UPLOADTHING — définition des règles de téléversement
//  Ici : une seule route "imageUploader" (1 image, 4 Mo max),
//  réservée à l'admin connecté.
// ============================================================

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { cookies } from "next/headers";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // Sécurité : seul l'admin connecté peut téléverser.
      const cookieStore = await cookies();
      const token = cookieStore.get("limak_admin")?.value;
      if (token !== process.env.ADMIN_SESSION_TOKEN) {
        throw new UploadThingError("Non autorisé");
      }
      return { admin: true };
    })
    .onUploadComplete(async ({ file }) => {
      // Après l'envoi, on renvoie l'adresse de l'image au navigateur.
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
