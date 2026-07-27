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
      "Supprimer définitivement ce produit ? Cette action est irréversible."
    );
    if (!ok) return;

    startTransition(async () => {
      await deleteProduct(id);
      router.push("/admin/produits"); // retour à la liste
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? "Suppression…" : "Supprimer ce produit"}
    </button>
  );
}
