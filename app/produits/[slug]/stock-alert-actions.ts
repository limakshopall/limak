// ============================================================
//  ACTION SERVEUR — inscription à l'alerte "retour en stock"
//  depuis la fiche produit (StockAlertForm).
// ============================================================

"use server";

import { prisma } from "../../lib/prisma";

function chiffresSeuls(raw: string): string {
  return raw.replace(/\D/g, "");
}

export async function subscribeStockAlert(
  productId: string,
  colorId: string | null,
  phoneRaw: string
): Promise<{ ok: boolean }> {
  const phone = chiffresSeuls(phoneRaw);
  // Numéro ivoirien : 8 chiffres locaux, 10 avec le "0" initial, ou +225 + 10.
  if (phone.length < 8 || phone.length > 13) return { ok: false };
  if (!productId) return { ok: false };

  try {
    const dejaInscrit = await prisma.stockAlert.findFirst({
      where: { productId, colorId, phone },
      select: { id: true },
    });
    if (!dejaInscrit) {
      await prisma.stockAlert.create({ data: { productId, colorId, phone } });
    }
    return { ok: true };
  } catch (error) {
    console.error("[stockAlerts] Échec d'inscription:", error);
    return { ok: false };
  }
}
