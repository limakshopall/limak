// ============================================================
//  Annulation de commande — partagée entre l'admin et l'espace client.
//  Remet les articles en stock (idempotent : ne restaure rien si la
//  commande était déjà annulée, pour éviter un double crédit de stock).
// ============================================================

import { prisma } from "./prisma";

// Mak Points : 15% du sous-total, crédités uniquement à la livraison
// (pas de compte "invité" -> pas de points si la commande n'a pas de clerkUserId).
const TAUX_MAK_POINTS = 0.15;

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

// Passe une commande à "Livrée" et crédite les Mak Points du client
// (idempotent : ne crédite rien si elle était déjà livrée).
export async function livrerCommandeEtCrediterMakPoints(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const commande = await tx.order.findUnique({ where: { id: orderId } });
    if (!commande) return null;
    if (commande.status === "DELIVERED") return commande;

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: "DELIVERED" },
    });

    if (commande.clerkUserId) {
      await tx.makPointEntry.create({
        data: {
          clerkUserId: commande.clerkUserId,
          orderId,
          points: Math.round(commande.subtotal * TAUX_MAK_POINTS),
        },
      });
    }

    return updated;
  });
}
