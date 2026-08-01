// ============================================================
//  ACTION SERVEUR — enregistre (ou met à jour) l'avis d'un client
//  Réservé aux clients connectés ET qui ont commandé le produit.
// ============================================================

"use server";

import { prisma } from "../../lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type ReviewInput = {
  productId: string;
  slug: string;
  rating: number;
  comment: string;
};

export async function submitReview(input: ReviewInput) {
  // 1) Le client doit être connecté
  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, error: "Vous devez être connecté pour laisser un avis." };
  }

  // 2) Valider la note
  const rating = Math.round(input.rating);
  if (rating < 1 || rating > 5) {
    return { ok: false as const, error: "Merci de choisir une note entre 1 et 5 étoiles." };
  }

  // 3) Vérifier l'ACHAT : le client doit avoir une commande (non annulée)
  //    contenant ce produit.
  const aCommande = await prisma.order.findFirst({
    where: {
      clerkUserId: userId,
      status: { not: "CANCELLED" },
      items: { some: { variant: { productId: input.productId } } },
    },
    select: { id: true },
  });
  if (!aCommande) {
    return {
      ok: false as const,
      error: "Vous ne pouvez laisser un avis que sur un article que vous avez commandé.",
    };
  }

  const comment = input.comment?.trim() || null;

  // 4) Nom d'affichage depuis Clerk
  const user = await currentUser();
  const authorName =
    user?.firstName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "Client";

  // 5) Créer ou mettre à jour l'avis
  try {
    await prisma.review.upsert({
      where: {
        productId_clerkUserId: {
          productId: input.productId,
          clerkUserId: userId,
        },
      },
      create: {
        productId: input.productId,
        clerkUserId: userId,
        authorName,
        rating,
        comment,
      },
      update: { rating, comment, authorName },
    });
  } catch (error) {
    console.error("[Avis] Échec de l'enregistrement:", error);
    return { ok: false as const, error: "Une erreur est survenue. Réessayez." };
  }

  revalidatePath(`/produits/${input.slug}`);
  return { ok: true as const };
}