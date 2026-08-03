// ============================================================
//  ACTIONS SERVEUR — système d'amis (base pour les cadeaux entre comptes)
//  Les comptes sont identifiés par clerkUserId (comme les avis/commandes).
//  La recherche d'un ami par email passe par l'API Clerk (pas d'annuaire
//  local : la table User n'est pas utilisée dans ce projet).
// ============================================================

"use server";

import { prisma } from "../lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function envoyerDemandeAmi(email: string) {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, error: "Connecte-toi pour ajouter un ami." };
  }

  const mail = email.trim().toLowerCase();
  if (!mail) {
    return { ok: false as const, error: "Entre un email." };
  }

  const client = await clerkClient();
  const { data: comptes } = await client.users.getUserList({ emailAddress: [mail] });
  const cible = comptes[0];

  if (!cible) {
    return { ok: false as const, error: "Aucun compte LIMAK n'utilise cet email." };
  }
  if (cible.id === userId) {
    return { ok: false as const, error: "Tu ne peux pas t'ajouter toi-même." };
  }

  const existante = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, addresseeId: cible.id },
        { requesterId: cible.id, addresseeId: userId },
      ],
    },
  });
  if (existante) {
    return {
      ok: false as const,
      error: existante.status === "ACCEPTED" ? "Vous êtes déjà amis." : "Une demande existe déjà entre vous deux.",
    };
  }

  await prisma.friendship.create({
    data: { requesterId: userId, addresseeId: cible.id, status: "PENDING" },
  });

  revalidatePath("/amis");
  return { ok: true as const };
}

export async function repondreDemandeAmi(friendshipId: string, accepter: boolean) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "Connecte-toi." };

  const demande = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!demande || demande.addresseeId !== userId || demande.status !== "PENDING") {
    return { ok: false as const, error: "Demande introuvable." };
  }

  await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: accepter ? "ACCEPTED" : "DECLINED" },
  });

  revalidatePath("/amis");
  return { ok: true as const };
}

export async function supprimerAmi(friendshipId: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "Connecte-toi." };

  const demande = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!demande || (demande.requesterId !== userId && demande.addresseeId !== userId)) {
    return { ok: false as const, error: "Introuvable." };
  }

  await prisma.friendship.delete({ where: { id: friendshipId } });

  revalidatePath("/amis");
  return { ok: true as const };
}
