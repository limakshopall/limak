"use server";

import { prisma } from "../../lib/prisma";
import { sendOrderStatusSms } from "../../lib/sms";
import { annulerCommandeEtRestaurerStock, livrerCommandeEtCrediterMakPoints } from "../../lib/orders";

export async function updateOrderStatus(orderId: string, status: string) {
  const allowed = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!orderId || !allowed.includes(status)) return;

  const order =
    status === "CANCELLED"
      ? await annulerCommandeEtRestaurerStock(orderId)
      : status === "DELIVERED"
        ? await livrerCommandeEtCrediterMakPoints(orderId)
        : await prisma.order.update({
            where: { id: orderId },
            data: {
              status: status as "PENDING" | "CONFIRMED" | "SHIPPED",
            },
          });
  if (!order) return;

  if (status !== "PENDING") {
    const orderRef = order.id.slice(-6).toUpperCase();
    await sendOrderStatusSms({
      phone: order.customerPhone,
      orderId: orderRef,
      status: status as "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED",
    });
  }
}

// Supprime une commande (ex: commandes de test créées pendant le développement).
// Les OrderItem liés partent automatiquement (onDelete: Cascade dans le schéma).
export async function deleteOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  if (!orderId) return { ok: false, error: "Commande introuvable." };
  try {
    await prisma.order.delete({ where: { id: orderId } });
    return { ok: true };
  } catch {
    return { ok: false, error: "Erreur lors de la suppression." };
  }
}