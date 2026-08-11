// ============================================================
//  BOUTON SUPPRIMER UNE COMMANDE — Client Component (confirmation)
//  Suppression définitive — irréversible.
// ============================================================

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteOrder } from "./actions";

export default function DeleteOrderButton({ id, ref: reference }: { id: string; ref: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const ok = window.confirm(
      `Supprimer définitivement la commande n°${reference} ? Cette action est irréversible.`
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteOrder(id);
      if (!result.ok) {
        window.alert(result.error ?? "Erreur lors de la suppression.");
        return;
      }
      router.push("/admin/commandes");
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
      {isPending ? "Suppression…" : "Supprimer cette commande"}
    </button>
  );
}
