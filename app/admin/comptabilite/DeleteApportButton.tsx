// ============================================================
//  BOUTON SUPPRIMER UN APPORT EXTÉRIEUR — Client Component (confirmation)
// ============================================================

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteApport } from "./actions";

export default function DeleteApportButton({ id, montant }: { id: string; montant: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const ok = window.confirm(
      `Supprimer l'apport de ${new Intl.NumberFormat("fr-FR").format(montant)} FCFA ? Cette action est irréversible.`
    );
    if (!ok) return;
    startTransition(async () => {
      await deleteApport(id);
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
