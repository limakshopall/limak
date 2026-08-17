import "dotenv/config";
import { subscribeStockAlert } from "./app/produits/[slug]/stock-alert-actions.ts";
import { notifierRetourEnStock } from "./app/lib/stockAlerts.ts";
import { prisma } from "./app/lib/prisma.ts";

const PRODUCT_ID_PUMA = (
  await prisma.product.findUnique({ where: { slug: "puma-future-rider-blanc-rouge-bleu-marine" }, select: { id: true } })
).id;

console.log("1) Inscription d'une alerte (numéro test)...");
const inscription = await subscribeStockAlert(PRODUCT_ID_PUMA, null, "0700000000");
console.log("   →", inscription);

const alertes = await prisma.stockAlert.findMany({ where: { productId: PRODUCT_ID_PUMA, colorId: null } });
console.log("2) Alertes en base pour ce produit:", alertes.map((a) => ({ phone: a.phone, notifiedAt: a.notifiedAt })));

console.log("3) Double inscription (même numéro) — ne doit PAS dupliquer...");
await subscribeStockAlert(PRODUCT_ID_PUMA, null, "07 00 00 00 00"); // même numéro, formaté différemment
const alertesApres = await prisma.stockAlert.findMany({ where: { productId: PRODUCT_ID_PUMA, colorId: null } });
console.log("   → nombre de lignes:", alertesApres.length, "(attendu: 1)");

console.log("4) Déclenchement notifierRetourEnStock alors que le stock est TOUJOURS à 0 (ne doit rien envoyer)...");
await notifierRetourEnStock(PRODUCT_ID_PUMA, null);
const apresAppelVide = await prisma.stockAlert.findFirst({ where: { productId: PRODUCT_ID_PUMA, colorId: null, phone: "0700000000" } });
console.log("   → notifiedAt (attendu: null):", apresAppelVide.notifiedAt);

console.log("5) On remet du stock sur une variante puis on redéclenche...");
const variante = await prisma.productVariant.findFirst({ where: { productId: PRODUCT_ID_PUMA, stock: { lte: 0 } } });
await prisma.productVariant.update({ where: { id: variante.id }, data: { stock: 5 } });
await notifierRetourEnStock(PRODUCT_ID_PUMA, null);
const apresAppelPlein = await prisma.stockAlert.findFirst({ where: { productId: PRODUCT_ID_PUMA, colorId: null, phone: "0700000000" } });
console.log("   → notifiedAt (attendu: une date):", apresAppelPlein.notifiedAt);

console.log("6) Nettoyage : remise du stock à 0 et suppression de l'alerte de test...");
await prisma.productVariant.update({ where: { id: variante.id }, data: { stock: 0 } });
await prisma.stockAlert.deleteMany({ where: { productId: PRODUCT_ID_PUMA, phone: "0700000000" } });
console.log("   → fait.");

await prisma.$disconnect();
