// ============================================================
//  BOUTON SUPPRIMER UNE VARIANTE — Client Component (confirmation)
// ============================================================

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteVariant } from "./actions";

export default function DeleteVariantButton({
  variantId,
  productId,
}: {
  variantId: string;
  productId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const ok = window.confirm("Supprimer cette variante ?");
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteVariant(variantId, productId);
      if (!result.ok) {
        window.alert(result.error ?? "Erreur lors de la suppression.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-sm font-medium text-[#D6293E] hover:underline disabled:opacity-50"
    >
      {isPending ? "Suppression…" : "Supprimer"}
    </button>
  );
}
