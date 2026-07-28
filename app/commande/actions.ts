// ============================================================
//  ACTION SERVEUR — enregistre une commande dans la base
//  Recalcule les prix côté serveur. Si le client est connecté
//  (Clerk), on rattache la commande à son compte.
// ============================================================

"use server";

import { prisma } from "../lib/prisma";
import { auth } from "@clerk/nextjs/server";

type CartLine = { productId: string; quantity: number };

type OrderInput = {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  items: CartLine[];
};

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

  const order = await prisma.order.create({
    data: {
      clerkUserId: userId ?? null, // rattaché au compte si connecté
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

  return { ok: true as const, orderId: order.id, total };
}
