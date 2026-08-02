// ============================================================
//  BOUTON SUPPRIMER UNE CATÉGORIE — Client Component (confirmation)
// ============================================================

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory } from "./actions";

export default function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const ok = window.confirm(
      `Supprimer la catégorie « ${name} » ? Les produits et sous-catégories liés ne seront pas supprimés, ils perdront juste cette catégorie.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteCategory(id);
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
