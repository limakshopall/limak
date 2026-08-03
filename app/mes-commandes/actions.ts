"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../lib/prisma";
import { annulerCommandeEtRestaurerStock } from "../lib/orders";
import { sendOrderStatusSms } from "../lib/sms";

// Le client ne peut annuler que tant qu'on n'a pas commencé à préparer sa commande.
// Au-delà (confirmée, expédiée...), il doit nous contacter directement.
const STATUTS_ANNULABLES_PAR_CLIENT = ["PENDING"];

export async function annulerMaCommande(orderId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, error: "Connectez-vous pour annuler une commande." };
  }

  const commande = await prisma.order.findUnique({ where: { id: orderId } });
  if (!commande || commande.clerkUserId !== userId) {
    return { ok: false as const, error: "Commande introuvable." };
  }
  if (!STATUTS_ANNULABLES_PAR_CLIENT.includes(commande.status)) {
    return {
      ok: false as const,
      error: "Cette commande ne peut plus être annulée en ligne — contactez-nous.",
    };
  }

  const updated = await annulerCommandeEtRestaurerStock(orderId);
  if (!updated) {
    return { ok: false as const, error: "Commande introuvable." };
  }

  await sendOrderStatusSms({
    phone: updated.customerPhone,
    orderId: updated.id.slice(-6).toUpperCase(),
    status: "CANCELLED",
  });

  return { ok: true as const };
}
