// ============================================================
//  UPLOADTHING — génère les composants de téléversement
//  (le bouton qu'on utilisera dans l'admin)
// ============================================================

import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { OurFileRouter } from "../api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
