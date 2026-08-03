// ============================================================
//  Annulation de commande — partagée entre l'admin et l'espace client.
//  Remet les articles en stock (idempotent : ne restaure rien si la
//  commande était déjà annulée, pour éviter un double crédit de stock).
// ============================================================

import { prisma } from "./prisma";

export async function annulerCommandeEtRestaurerStock(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const commande = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!commande) return null;
    if (commande.status === "CANCELLED") return commande;

    for (const item of commande.items) {
      if (!item.variantId) continue; // variante supprimée depuis : rien à restaurer
      await tx.productVariant.updateMany({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
  });
}
