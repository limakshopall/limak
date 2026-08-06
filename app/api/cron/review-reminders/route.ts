// ============================================================
//  CRON — rappel "laissez un avis" après livraison
//  Appelée automatiquement chaque jour par Vercel Cron (voir
//  vercel.json). Envoie un email aux commandes livrées depuis au
//  moins DELAI_JOURS jours, avec un email connu, et pas encore
//  relancées — chacune une seule fois (reviewReminderSentAt).
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { sendReviewReminderEmail } from "../../../lib/email";

const DELAI_JOURS = 2;

export async function GET(request: NextRequest) {
  // Vercel Cron envoie automatiquement ce header avec le secret configuré —
  // ça évite que n'importe qui déclenche l'envoi en visitant l'URL.
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const seuil = new Date();
  seuil.setDate(seuil.getDate() - DELAI_JOURS);

  const commandes = await prisma.order.findMany({
    where: {
      status: "DELIVERED",
      customerEmail: { not: null },
      reviewReminderSentAt: null,
      updatedAt: { lte: seuil },
    },
    select: { id: true, customerEmail: true, customerName: true },
  });

  let envoyes = 0;
  for (const cmd of commandes) {
    await sendReviewReminderEmail({
      email: cmd.customerEmail!,
      orderId: cmd.id.slice(-6).toUpperCase(),
      customerName: cmd.customerName,
    });
    await prisma.order.update({
      where: { id: cmd.id },
      data: { reviewReminderSentAt: new Date() },
    });
    envoyes += 1;
  }

  return NextResponse.json({ ok: true, envoyes });
}
