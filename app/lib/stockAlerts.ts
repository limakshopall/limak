// ============================================================
//  ALERTES DE RETOUR EN STOCK — déclenché après chaque sauvegarde
//  de stock côté admin. Prévient par SMS les clients qui attendaient
//  ce produit (couleur précise ou non), puis marque l'alerte comme
//  envoyée pour ne jamais la redéclencher.
// ============================================================

import { prisma } from "./prisma";
import { sendStockAlertSms } from "./sms";

// Best-effort : appelé APRÈS la sauvegarde du stock, jamais dans la
// même transaction — un échec SMS ne doit jamais faire échouer une
// mise à jour de stock admin.
export async function notifierRetourEnStock(
  productId: string,
  colorId: string | null
): Promise<void> {
  try {
    const alertesEnAttente = await prisma.stockAlert.findMany({
      where: { productId, colorId, notifiedAt: null },
    });
    if (alertesEnAttente.length === 0) return;

    const { _sum } = await prisma.productVariant.aggregate({
      where: { productId, colorId },
      _sum: { stock: true },
    });
    if ((_sum.stock ?? 0) <= 0) return;

    const produit = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true },
    });
    if (!produit) return;

    await Promise.all(
      alertesEnAttente.map(async (alerte) => {
        await sendStockAlertSms({ phone: alerte.phone, productName: produit.name });
        await prisma.stockAlert.update({
          where: { id: alerte.id },
          data: { notifiedAt: new Date() },
        });
      })
    );
  } catch (error) {
    console.error("[stockAlerts] Échec de notification retour en stock:", error);
  }
}
