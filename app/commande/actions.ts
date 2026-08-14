// ============================================================
//  ACTION SERVEUR — enregistre une commande dans la base
//  - Recalcule les prix côté serveur
//  - Vérifie ET diminue le stock de façon sûre (pas de survente)
//  - Rattache au compte Clerk si connecté
//  - Envoie un SMS de confirmation au client + un email d'alerte à l'admin
//    (l'admin était avant alerté par SMS, changé pour réduire les coûts)
// ============================================================

"use server";

import { prisma } from "../lib/prisma";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { sendOrderConfirmationSms, sendGiftNotificationSms } from "../lib/sms";
import { sendAdminOrderAlertEmail } from "../lib/email";

type CartLine = { variantId: string; quantity: number };

type OrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null; // facultatif — permet le rappel email après livraison
  shippingAddress: string;
  shippingCity: string;
  shippingLat?: number | null;
  shippingLng?: number | null;
  giftForClerkUserId?: string | null;
  giftMessage?: string | null;
  items: CartLine[];
};

// Amis (demandes acceptées) du client connecté, pour le sélecteur "Offrir à un ami".
export async function listerAmisAcceptes() {
  const { userId } = await auth();
  if (!userId) return [];

  const liens = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
  });
  if (liens.length === 0) return [];

  const amiIds = liens.map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId));
  const client = await clerkClient();
  const { data } = await client.users.getUserList({ userId: amiIds, limit: amiIds.length });

  return data.map((u) => ({
    clerkUserId: u.id,
    nom: u.fullName || u.primaryEmailAddress?.emailAddress || "Ami LIMAK",
  }));
}

// Pré-remplit le formulaire de livraison avec les coordonnées de la dernière
// commande de l'ami (si il en a déjà passé une) — juste une suggestion, modifiable.
export async function suggestionAdresseAmi(amiClerkUserId: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const };

  // Sécurité : on ne renseigne cette suggestion que si c'est un ami confirmé.
  const lien = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: userId, addresseeId: amiClerkUserId },
        { requesterId: amiClerkUserId, addresseeId: userId },
      ],
    },
  });
  if (!lien) return { ok: false as const };

  const derniereCommande = await prisma.order.findFirst({
    where: { clerkUserId: amiClerkUserId, isGift: false },
    orderBy: { createdAt: "desc" },
    select: { customerName: true, customerPhone: true, shippingAddress: true, shippingCity: true },
  });

  return { ok: true as const, suggestion: derniereCommande };
}

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
  const email = input.customerEmail?.trim() || null;
  const address = input.shippingAddress?.trim();
  const city = input.shippingCity?.trim();

  if (!name || !phone || !address || !city) {
    return { ok: false as const, error: "Merci de remplir tous les champs de livraison." };
  }
  if (!input.items || input.items.length === 0) {
    return { ok: false as const, error: "Votre panier est vide." };
  }

  const { userId } = await auth();

  // Commande-cadeau : vérifie que le destinataire est bien un ami confirmé
  // (on ne fait pas confiance à ce que le client envoie).
  let giftFromName: string | null = null;
  const isGift = Boolean(input.giftForClerkUserId);
  if (isGift) {
    if (!userId) {
      return { ok: false as const, error: "Connecte-toi pour offrir une commande à un ami." };
    }
    const lien = await prisma.friendship.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { requesterId: userId, addresseeId: input.giftForClerkUserId! },
          { requesterId: input.giftForClerkUserId!, addresseeId: userId },
        ],
      },
    });
    if (!lien) {
      return { ok: false as const, error: "Cette personne n'est pas dans ta liste d'amis." };
    }
    const moi = await currentUser();
    giftFromName = moi?.fullName || moi?.primaryEmailAddress?.emailAddress || "Un ami";
  }

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
          customerEmail: email,
          shippingAddress: address,
          shippingCity: city,
          shippingLat: input.shippingLat ?? null,
          shippingLng: input.shippingLng ?? null,
          isGift,
          giftForClerkUserId: isGift ? input.giftForClerkUserId : null,
          giftFromName,
          giftMessage: isGift ? input.giftMessage?.trim() || null : null,
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

  if (isGift && giftFromName) {
    // Le destinataire reçoit une notification cadeau (jamais le prix).
    await sendGiftNotificationSms({ phone, orderId: orderRef, giftFromName });
  } else {
    await sendOrderConfirmationSms({
      phone,
      orderId: orderRef,
      customerName: name,
      total,
    });
  }

  await sendAdminOrderAlertEmail({
    orderId: orderRef,
    customerName: isGift ? `${name} (🎁 cadeau de ${giftFromName})` : name,
    customerPhone: phone,
    shippingCity: city,
    shippingAddress: address,
    total,
    itemCount,
  });

  return { ok: true as const, orderId: order.id, total };
}