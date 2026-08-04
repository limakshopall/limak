// ============================================================
//  TÉLÉVERSEMENT D'IMAGE PRODUIT — Client Component
//  Envoie l'image sur UploadThing, puis enregistre son adresse
//  en base pour ce produit (et éventuellement une couleur précise).
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { UploadButton } from "../../../lib/uploadthing";
import { addProductImage } from "./actions";
import { measureImage } from "../../../lib/measureImage";

export default function ProductImageUploader({
  productId,
  colorId,
  sizeId,
}: {
  productId: string;
  colorId?: string | null;
  sizeId?: string | null;
}) {
  const router = useRouter();

  return (
    <div className="w-40 shrink-0">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={async (res) => {
          const url = res?.[0]?.ufsUrl;
          if (url) {
            const dims = await measureImage(url).catch(() => null);
            await addProductImage(productId, url, colorId ?? null, sizeId ?? null, dims?.width, dims?.height);
            router.refresh(); // rafraîchit pour afficher la nouvelle image
          }
        }}
        onUploadError={(error: Error) => {
          alert(`Erreur de téléversement : ${error.message}`);
        }}
      />
      <p className="mt-2 text-xs text-neutral-400 dark:text-gray-400">
        Formats image, 4 Mo max. L&apos;image s&apos;ajoute une fois envoyée.
      </p>
    </div>
  );
}
