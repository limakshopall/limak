// ============================================================
//  FORMULAIRE DE STATUT — Client Component
//  Change le statut d'une commande PUIS rafraîchit la page.
// ============================================================

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "./actions";

const STATUTS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(newStatus: string) {
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
      router.refresh(); // rafraîchit l'affichage tout de suite
    });
  }

  return (
    <div className="mt-4 flex items-center gap-2 border-t border-[#14213D]/10 pt-3">
      <label className="text-sm text-neutral-500">Statut :</label>
      <select
        defaultValue={currentStatus}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-[#14213D]/15 px-2 py-1 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] disabled:opacity-50"
      >
        {Object.entries(STATUTS).map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
      {isPending && <span className="text-xs text-neutral-400">Enregistrement…</span>}
    </div>
  );
}
