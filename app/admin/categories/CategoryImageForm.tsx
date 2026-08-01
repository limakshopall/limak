// ============================================================
//  IMAGE D'UNE CATÉGORIE (admin) — Client Component
//  Aperçu + bouton pour téléverser/remplacer la photo.
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadButton } from "../../lib/uploadthing";
import { updateCategoryImage } from "./actions";

export default function CategoryImageForm({
  categoryId,
  name,
  imageUrl,
}: {
  categoryId: string;
  name: string;
  imageUrl: string | null;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#14213D]/15 bg-[#FBEEDA] dark:border-white/15 dark:bg-[#1c2333]">
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="64px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400 dark:text-gray-400">
            photo
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[#14213D] dark:text-gray-300">{name}</p>
        <div className="mt-1">
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={async (res) => {
              const url = res?.[0]?.ufsUrl;
              if (url) {
                await updateCategoryImage(categoryId, url);
                router.refresh();
              }
            }}
            onUploadError={(err: Error) => alert(`Erreur de téléversement : ${err.message}`)}
          />
        </div>
      </div>
    </div>
  );
}
