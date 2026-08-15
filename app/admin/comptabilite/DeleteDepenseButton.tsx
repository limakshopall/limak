// ============================================================
//  BOUTON SUPPRIMER UNE DÉPENSE — Client Component (confirmation)
// ============================================================

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDepense } from "./actions";

export default function DeleteDepenseButton({ id, motif }: { id: string; motif: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const ok = window.confirm(`Supprimer la dépense « ${motif} » ? Cette action est irréversible.`);
    if (!ok) return;
    startTransition(async () => {
      await deleteDepense(id);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-medium text-[#D6293E] hover:underline disabled:opacity-50"
    >
      {isPending ? "…" : "Supprimer"}
    </button>
  );
}
