// ============================================================
//  BOUTONS — accepter/refuser une demande reçue, ou retirer un ami
//  (Client Component)
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { repondreDemandeAmi, supprimerAmi } from "./actions";

export default function DemandeActions({
  friendshipId,
  mode,
}: {
  friendshipId: string;
  mode: "repondre" | "supprimer";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function repondre(accepter: boolean) {
    setLoading(true);
    await repondreDemandeAmi(friendshipId, accepter);
    setLoading(false);
    router.refresh();
  }

  async function retirer() {
    setLoading(true);
    await supprimerAmi(friendshipId);
    setLoading(false);
    router.refresh();
  }

  if (mode === "repondre") {
    return (
      <div className="flex shrink-0 gap-3">
        <button
          onClick={() => repondre(true)}
          disabled={loading}
          className="text-xs font-semibold text-[#1F7A5C] hover:underline disabled:opacity-50"
        >
          Accepter
        </button>
        <button
          onClick={() => repondre(false)}
          disabled={loading}
          className="text-xs font-semibold text-[#D6293E] hover:underline disabled:opacity-50"
        >
          Refuser
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={retirer}
      disabled={loading}
      className="shrink-0 text-xs text-neutral-400 hover:text-[#D6293E] disabled:opacity-50 dark:text-gray-400"
    >
      Retirer
    </button>
  );
}
