// ============================================================
//  FORMULAIRE — envoyer une demande d'ami par email (Client Component)
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { envoyerDemandeAmi } from "./actions";

export default function AjouterAmiForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function envoyer() {
    if (!email.trim()) return;
    setLoading(true);
    setMessage(null);
    const result = await envoyerDemandeAmi(email);
    setLoading(false);

    if (result.ok) {
      setMessage({ ok: true, texte: "Demande envoyée !" });
      setEmail("");
      router.refresh();
    } else {
      setMessage({ ok: false, texte: result.error });
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && envoyer()}
          placeholder="email@exemple.com"
          className="flex-1 rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15"
        />
        <button
          onClick={envoyer}
          disabled={loading}
          className="shrink-0 rounded-full bg-[#F1720A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#C95900] disabled:opacity-50"
        >
          {loading ? "..." : "Ajouter"}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${message.ok ? "text-[#1F7A5C]" : "text-[#D6293E]"}`}>{message.texte}</p>
      )}
    </div>
  );
}
