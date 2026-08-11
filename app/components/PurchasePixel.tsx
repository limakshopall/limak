// ============================================================
//  META PIXEL — événement Purchase (page de confirmation de commande)
//  Déclenché une seule fois par commande, même si la page est
//  rafraîchie (garde-fou via sessionStorage).
// ============================================================

"use client";

import { useEffect } from "react";
import { trackerMetaPixel } from "../lib/metaPixel";

export default function PurchasePixel({
  orderId,
  value,
  contentIds,
}: {
  orderId: string;
  value: number;
  contentIds: string[];
}) {
  useEffect(() => {
    const cle = `limak-purchase-suivi-${orderId}`;
    if (sessionStorage.getItem(cle)) return; // déjà envoyé (ex: rechargement de la page)
    trackerMetaPixel("Purchase", { value, currency: "XOF", content_ids: contentIds });
    sessionStorage.setItem(cle, "1");
  }, [orderId, value, contentIds]);

  return null;
}
