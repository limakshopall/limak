// ============================================================
//  "ME PRÉVENIR" — formulaire (numéro de téléphone) affiché quand la
//  combinaison choisie est en rupture de stock. Envoie un SMS unique
//  dès que le stock repasse à 1+ (voir app/lib/stockAlerts.ts).
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { subscribeStockAlert } from "./stock-alert-actions";

export default function StockAlertForm({
  productId,
  colorId,
}: {
  productId: string;
  colorId: string | null;
}) {
  const [phone, setPhone] = useState("");
  const [statut, setStatut] = useState<"idle" | "envoye" | "erreur">("idle");
  const [pending, startTransition] = useTransition();

  function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    startTransition(async () => {
      const res = await subscribeStockAlert(productId, colorId, phone.trim());
      setStatut(res.ok ? "envoye" : "erreur");
    });
  }

  if (statut === "envoye") {
    return (
      <p className="mb-3 text-sm font-medium text-[#1F7A5C]">
        ✓ On vous prévient par SMS dès le retour en stock.
      </p>
    );
  }

  return (
    <form onSubmit={envoyer} className="mb-3">
      <p className="mb-1.5 text-sm text-neutral-600 dark:text-gray-400">
        Prévenez-moi par SMS dès le retour en stock :
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ex : 07 00 00 00 00"
          required
          className="min-w-0 flex-1 rounded-lg border border-[#14213D]/15 bg-white px-3 py-2 text-sm text-[#14213D] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-[#14213D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1c2d52] disabled:opacity-50"
        >
          {pending ? "…" : "Me prévenir"}
        </button>
      </div>
      {statut === "erreur" && (
        <p className="mt-1.5 text-xs text-[#D6293E]">Numéro invalide, réessayez.</p>
      )}
    </form>
  );
}
