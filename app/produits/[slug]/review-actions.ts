// ============================================================
//  ACTION SERVEUR — enregistre (ou met à jour) l'avis d'un client
//  sur un produit. Réservé aux clients connectés (Clerk).
// ============================================================

"use server";

import { prisma } from "../../lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type ReviewInput = {
  productId: string;
  slug: string; // pour rafraîchir la bonne page produit
  rating: number;
  comment: string;
};

export async function submitReview(input: ReviewInput) {
  // 1) Le client doit être connecté
  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, error: "Vous devez être connecté pour laisser un avis." };
  }

  // 2) Valider la note (entier entre 1 et 5)
  const rating = Math.round(input.rating);
  if (rating < 1 || rating > 5) {
    return { ok: false as const, error: "Merci de choisir une note entre 1 et 5 étoiles." };
  }

  const comment = input.comment?.trim() || null;

  // 3) Récupérer le nom d'affichage depuis Clerk
  const user = await currentUser();
  const authorName =
    user?.firstName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "Client";

  // 4) Créer OU mettre à jour l'avis (un seul par produit et par client)
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
      update: {
        rating,
        comment,
        authorName, // au cas où le nom a changé
      },
    });
  } catch (error) {
    console.error("[Avis] Échec de l'enregistrement:", error);
    return { ok: false as const, error: "Une erreur est survenue. Réessayez." };
  }

  // 5) Rafraîchir la fiche produit pour afficher le nouvel avis
  revalidatePath(`/produits/${input.slug}`);
  return { ok: true as const };
}