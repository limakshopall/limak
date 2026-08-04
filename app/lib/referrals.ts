// ============================================================
//  PARRAINAGE — lie un nouveau compte à celui qui l'a invité
//  (lien WhatsApp ?ref=<clerkUserId> partagé depuis /amis).
// ============================================================

import { prisma } from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";

// Un compte n'est considéré "nouveau" que dans les 48h suivant sa création
// (évite qu'un compte ancien s'attribue un parrain juste en rouvrant un lien).
const DELAI_NOUVEAU_COMPTE_MS = 48 * 60 * 60 * 1000;

// Enregistre le lien parrain -> filleul si toutes les conditions sont réunies.
// Ne fait rien silencieusement sinon (lien rouvert, compte déjà parrainé,
// auto-parrainage...). Appelée depuis la page /amis à chaque visite avec ?ref=.
export async function attribuerParrainageSiNouveauCompte(
  refereeClerkUserId: string,
  referrerClerkUserId: string
) {
  if (!referrerClerkUserId || referrerClerkUserId === refereeClerkUserId) return;

  const dejaParraine = await prisma.referral.findUnique({
    where: { refereeClerkUserId },
  });
  if (dejaParraine) return;

  const client = await clerkClient();
  const compte = await client.users.getUser(refereeClerkUserId);
  const ancienneteMs = Date.now() - compte.createdAt;
  if (ancienneteMs > DELAI_NOUVEAU_COMPTE_MS) return;

  try {
    await prisma.referral.create({
      data: { referrerClerkUserId, refereeClerkUserId },
    });
  } catch {
    // Créé entre-temps par une requête concurrente (contrainte unique) : ignore.
  }
}

// Crée (ou renvoie) la demande d'ami liée au lien de parrainage WhatsApp.
// Le parrain devient "requester", la personne qui ouvre le lien "addressee".
// Silencieux si une demande/amitié existe déjà entre les deux, dans un sens ou l'autre.
export async function creerDemandeAmiDepuisLien(
  refereeClerkUserId: string,
  referrerClerkUserId: string
) {
  if (!referrerClerkUserId || referrerClerkUserId === refereeClerkUserId) return null;

  const existante = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: referrerClerkUserId, addresseeId: refereeClerkUserId },
        { requesterId: refereeClerkUserId, addresseeId: referrerClerkUserId },
      ],
    },
  });
  if (existante) return existante;

  try {
    return await prisma.friendship.create({
      data: { requesterId: referrerClerkUserId, addresseeId: refereeClerkUserId, status: "PENDING" },
    });
  } catch {
    // Créée entre-temps par une requête concurrente (contrainte unique) : on la relit.
    return prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: referrerClerkUserId, addresseeId: refereeClerkUserId },
          { requesterId: refereeClerkUserId, addresseeId: referrerClerkUserId },
        ],
      },
    });
  }
}
