// ============================================================
//  BOUTON SUPPRIMER — Client Component (avec confirmation)
// ============================================================

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "./actions";

export default function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Confirmation avant l'action irréversible
    const ok = window.confirm(
      "Supprimer définitivement cet article ? Cette action est irréversible."
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteProduct(id);
      if (!result.ok) {
        window.alert(result.error ?? "Erreur lors de la suppression.");
        return;
      }
      router.push("/admin/produits"); // retour à la liste
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm font-medium text-[#D6293E] hover:underline disabled:opacity-50"
    >
      {isPending ? "Suppression…" : "Supprimer cet article"}
    </button>
  );
}
