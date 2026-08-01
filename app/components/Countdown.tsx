// ============================================================
//  COMPTE À REBOURS — Client Component
//  Temps restant avant minuit (fin de la vente flash du jour).
//  Calculé côté client pour éviter tout décalage de fuseau horaire.
// ============================================================

"use client";

import { useEffect, useState } from "react";

function tempsRestantAujourdhui() {
  const maintenant = new Date();
  const minuit = new Date(maintenant);
  minuit.setHours(24, 0, 0, 0);
  return Math.max(0, minuit.getTime() - maintenant.getTime());
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Countdown() {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    setMs(tempsRestantAujourdhui());
    const t = setInterval(() => setMs(tempsRestantAujourdhui()), 1000);
    return () => clearInterval(t);
  }, []);

  // null le temps du premier rendu client (évite un décalage avec le serveur, qui n'a pas d'heure locale fiable)
  if (ms === null) return null;

  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);

  return (
    <div className="flex items-center gap-1 font-mono text-sm font-bold tabular-nums text-[#E8C255]">
      <span className="rounded bg-[#E8C255]/15 px-1.5 py-0.5">{pad(h)}</span>
      <span aria-hidden className="text-white/40">:</span>
      <span className="rounded bg-[#E8C255]/15 px-1.5 py-0.5">{pad(m)}</span>
      <span aria-hidden className="text-white/40">:</span>
      <span className="rounded bg-[#E8C255]/15 px-1.5 py-0.5">{pad(s)}</span>
    </div>
  );
}
