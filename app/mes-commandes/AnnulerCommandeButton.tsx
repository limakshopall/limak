// ============================================================
//  BOUTON "ANNULER LA COMMANDE" — Client Component
//  Visible uniquement pour les commandes encore "En attente".
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { annulerMaCommande } from "./actions";

export default function AnnulerCommandeButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm("Annuler cette commande ? Cette action est définitive.")) return;
    startTransition(async () => {
      const res = await annulerMaCommande(orderId);
      setErreur(res.ok ? null : res.error);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-xs font-semibold text-[#D6293E] hover:underline disabled:opacity-50"
      >
        {isPending ? "Annulation…" : "Annuler la commande"}
      </button>
      {erreur && <p className="mt-1 text-xs text-[#D6293E]">{erreur}</p>}
    </div>
  );
}
