// ============================================================
//  BANDEAU D'ANNONCE — Client Component
//  Message promotionnel affiché en haut de toutes les pages.
// ============================================================

"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "limak-announcement-dismissed";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    setVisible(true);
  }, []);

  function fermer() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  if (!visible) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-[#D6293E] px-4 py-1.5 text-xs font-medium text-white">
      <span className="truncate text-center">
        🚚 Livraison partout en Côte d&apos;Ivoire · Paiement à la livraison
      </span>
      <button
        onClick={fermer}
        aria-label="Fermer"
        className="shrink-0 text-white/70 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
