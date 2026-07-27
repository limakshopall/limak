// ============================================================
//  TÉLÉVERSEMENT D'IMAGE PRODUIT — Client Component
//  Envoie l'image sur UploadThing, puis enregistre son adresse
//  en base pour ce produit.
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { UploadButton } from "../../../lib/uploadthing";
import { addProductImage } from "./actions";

export default function ProductImageUploader({ productId }: { productId: string }) {
  const router = useRouter();

  return (
    <div>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={async (res) => {
          const url = res?.[0]?.ufsUrl;
          if (url) {
            await addProductImage(productId, url);
            router.refresh(); // rafraîchit pour afficher la nouvelle image
          }
        }}
        onUploadError={(error: Error) => {
          alert(`Erreur de téléversement : ${error.message}`);
        }}
      />
      <p className="mt-2 text-xs text-gray-400">
        Formats image, 4 Mo max. L'image s'ajoute au produit une fois envoyée.
      </p>
    </div>
  );
}
