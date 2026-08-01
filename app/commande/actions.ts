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

type CartLine = { variantId: string; quantity: number };

type OrderInput = {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingLat?: number | null;
  shippingLng?: number | null;
  items: CartLine[];
};

// Géocodage inverse (coordonnées GPS -> adresse lisible) via Nominatim/OpenStreetMap,
// gratuit et sans clé API. Le User-Agent identifiant est exigé par leur politique d'usage.
export async function reverseGeocode(lat: number, lng: number) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fr`;
    const res = await fetch(url, {
      headers: { "User-Agent": "LIMAK-boutique/1.0 (limak.shopall@gmail.com)" },
    });
    if (!res.ok) return { ok: false as const };

    const data = await res.json();
    const a = data.address ?? {};
    const rue = [a.road, a.house_number].filter(Boolean).join(" ");
    const quartier = a.suburb || a.neighbourhood || a.quarter;
    const adresse = [rue, quartier].filter(Boolean).join(", ") || data.display_name || "";
    const ville = a.city || a.town || a.village || a.county || "";

    return { ok: true as const, address: adresse, city: ville };
  } catch {
    return { ok: false as const };
  }
}

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

  const { userId } = await auth();

  const variantIds = input.items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: { select: { name: true } },
      color: { select: { name: true } },
      size: { select: { name: true } },
    },
  });

  const orderItems: {
    variantId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
  }[] = [];
  let subtotal = 0;

  for (const line of input.items) {
    const variant = variants.find((v) => v.id === line.variantId);
    if (!variant) continue;

    const quantity = Math.max(1, Math.floor(line.quantity));
    subtotal += variant.price * quantity;

    const label = [variant.color?.name, variant.size?.name].filter(Boolean).join(" / ");
    orderItems.push({
      variantId: variant.id,
      productName: label ? `${variant.product.name} (${label})` : variant.product.name,
      unitPrice: variant.price,
      quantity,
    });
  }

  if (orderItems.length === 0) {
    return { ok: false as const, error: "Aucun article valide dans le panier." };
  }

  const shipping = 0;
  const total = subtotal + shipping;

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
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
          shippingLat: input.shippingLat ?? null,
          shippingLng: input.shippingLng ?? null,
          subtotal,
          shipping,
          total,
          currency: "XOF",
          items: { create: orderItems },
        },
      });
    });
  } catch (err) {
    if (err instanceof StockError) {
      return { ok: false as const, error: err.message };
    }
    throw err;
  }

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