// ============================================================
//  ACTION SERVEUR — enregistre une commande dans la base
//  - Recalcule les prix côté serveur
//  - Vérifie ET diminue le stock de façon sûre (pas de survente)
//  - Rattache au compte Clerk si connecté
//  - Envoie 2 SMS : confirmation au client + alerte à l'admin
// ============================================================

"use server";

import { prisma } from "../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { sendOrderConfirmationSms, sendAdminOrderAlertSms } from "../lib/sms";

type CartLine = { productId: string; quantity: number };

type OrderInput = {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  items: CartLine[];
};

// Petite erreur "maison" pour transporter un message de stock lisible.
class StockError extends Error {}

export async function createOrder(input: OrderInput) {
  const name = input.customerName?.trim();
  const phone = input.customerPhone?.trim();
  const address = input.shippingAddress?.trim();
  const city = input.shippingCity?.trim();

  if (!name || !phone || !address || !city) {
    return { ok: false as const, error: "Merci de remplir tous les champs de livraison." };
  }
  if (!input.items || input.items.length === 0) {
    return { ok: false as const, error: "Votre panier est vide." };
  }

  // Identifiant du client connecté (null si commande "invité")
  const { userId } = await auth();

  const productIds = input.items.map((i) => i.productId);
  const produits = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: { orderBy: { price: "asc" }, take: 1 } },
  });

  const orderItems: {
    variantId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
  }[] = [];
  let subtotal = 0;

  for (const line of input.items) {
    const produit = produits.find((p) => p.id === line.productId);
    const variant = produit?.variants[0];
    if (!produit || !variant) continue;

    const quantity = Math.max(1, Math.floor(line.quantity));
    subtotal += variant.price * quantity;

    orderItems.push({
      variantId: variant.id,
      productName: produit.name,
      unitPrice: variant.price,
      quantity,
    });
  }

  if (orderItems.length === 0) {
    return { ok: false as const, error: "Aucun produit valide dans le panier." };
  }

  const shipping = 0;
  const total = subtotal + shipping;

  // --- Transaction : vérifier+diminuer le stock, puis créer la commande ---
  // Si un seul article manque de stock, TOUT est annulé (rien n'est débité).
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        // On ne diminue QUE si le stock est suffisant (stock >= quantité).
        // updateMany renvoie le nombre de lignes modifiées : 1 = OK, 0 = stock insuffisant.
        const res = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (res.count === 0) {
          throw new StockError(
            `« ${item.productName} » n'est plus disponible en quantité suffisante.`
          );
        }
      }

      // Tous les stocks ont été retirés avec succès : on crée la commande.
      return tx.order.create({
        data: {
          clerkUserId: userId ?? null,
          status: "PENDING",
          paymentMethod: "CASH_ON_DELIVERY",
          paymentStatus: "PENDING",
          customerName: name,
          customerPhone: phone,
          shippingAddress: address,
          shippingCity: city,
          subtotal,
          shipping,
          total,
          currency: "XOF",
          items: { create: orderItems },
        },
      });
    });
  } catch (err) {
    // Erreur de stock -> message clair pour le client, commande non créée.
    if (err instanceof StockError) {
      return { ok: false as const, error: err.message };
    }
    // Autre erreur inattendue -> on la laisse remonter.
    throw err;
  }

  // --- Notifications SMS (après commande réussie ; ne bloquent jamais) ---
  const orderRef = order.id.slice(-6).toUpperCase();
  const itemCount = orderItems.reduce((n, i) => n + i.quantity, 0);

  await sendOrderConfirmationSms({
    phone,
    orderId: orderRef,
    customerName: name,
    total,
  });

  await sendAdminOrderAlertSms({
    orderId: orderRef,
    customerName: name,
    customerPhone: phone,
    shippingCity: city,
    total,
    itemCount,
  });

  return { ok: true as const, orderId: order.id, total };
}