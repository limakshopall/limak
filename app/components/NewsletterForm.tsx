// ============================================================
//  FORMULAIRE NEWSLETTER (pied de page) — Client Component
//  Pas de backend d'abonnement pour l'instant : confirmation visuelle
//  uniquement, rien n'est enregistré. À brancher plus tard si besoin.
// ============================================================

"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEnvoye(true);
    setEmail("");
  }

  if (envoye) {
    return (
      <p className="text-sm text-[#C9A84C]">
        Merci ! Vous serez informé(e) de nos prochaines offres.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre email"
        className="w-full rounded-full border border-[#C9A84C]/40 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#C9A84C]"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#14213D] transition hover:bg-[#dbbb62]"
      >
        OK
      </button>
    </form>
  );
}
