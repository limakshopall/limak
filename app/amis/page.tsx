// ============================================================
//  PAGE AMIS  ->  /amis
//  Liste d'amis + demandes reçues/envoyées. Base pour le futur
//  système de cadeaux entre comptes (Server Component).
// ============================================================

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../lib/prisma";
import { attribuerParrainageSiNouveauCompte, creerDemandeAmiDepuisLien } from "../lib/referrals";
import AjouterAmiForm from "./AjouterAmiForm";
import DemandeActions from "./DemandeActions";
import PartagerWhatsAppButton from "./PartagerWhatsAppButton";

export const metadata = { title: "Mes amis" };

export default async function AmisPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { userId } = await auth();
  const { ref } = await searchParams;

  let demandeLien = null;
  if (userId && ref) {
    await attribuerParrainageSiNouveauCompte(userId, ref);
    demandeLien = await creerDemandeAmiDepuisLien(userId, ref);
  }

  if (!userId) {
    return (
      <main className="mx-auto max-w-2xl bg-[#FBEEDA] px-4 py-16 text-center dark:bg-[#1c2333]">
        <h1 className="text-2xl font-bold text-[#14213D] dark:text-gray-300">Mes amis</h1>
        <p className="mt-2 text-neutral-500 dark:text-gray-400">
          Connecte-toi pour ajouter des amis et (bientôt) leur offrir des cadeaux.
        </p>
      </main>
    );
  }

  const liens = await prisma.friendship.findMany({
    where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
    orderBy: { createdAt: "desc" },
  });

  const amis = liens.filter((f) => f.status === "ACCEPTED");
  const recues = liens.filter(
    (f) => f.status === "PENDING" && f.addresseeId === userId && f.id !== demandeLien?.id
  );
  const envoyees = liens.filter((f) => f.status === "PENDING" && f.requesterId === userId);

  // Profils Clerk (nom/email) des comptes en face, récupérés en un seul appel groupé.
  const autresIds = Array.from(
    new Set(
      [...amis, ...recues, ...envoyees]
        .map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId))
        .concat(ref ? [ref] : [])
    )
  );

  const profils = new Map<string, string>();
  if (autresIds.length > 0) {
    const client = await clerkClient();
    const { data } = await client.users.getUserList({ userId: autresIds, limit: autresIds.length });
    for (const u of data) {
      profils.set(u.id, u.fullName || u.primaryEmailAddress?.emailAddress || "Compte LIMAK");
    }
  }
  const nomDe = (id: string) => profils.get(id) ?? "Compte LIMAK";

  return (
    <main className="mx-auto max-w-2xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <h1 className="mb-6 text-2xl font-bold text-[#14213D] dark:text-gray-300">Mes amis</h1>

      {demandeLien?.status === "PENDING" && demandeLien.addresseeId === userId && (
        <div className="mb-6 rounded-xl border border-[#F1720A]/30 bg-[#F1720A]/10 p-4 text-center">
          <p className="text-sm text-[#14213D] dark:text-gray-200">
            <span className="font-semibold">{nomDe(ref!)}</span> souhaite devenir votre ami(e).
          </p>
          <div className="mt-3 flex justify-center gap-3">
            <DemandeActions friendshipId={demandeLien.id} mode="repondre" />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <h2 className="mb-3 font-semibold text-[#14213D] dark:text-gray-300">Ajouter un ami</h2>
        <AjouterAmiForm />
      </div>

      {recues.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
          <h2 className="mb-3 font-semibold text-[#14213D] dark:text-gray-300">
            Demandes reçues ({recues.length})
          </h2>
          <ul className="space-y-3">
            {recues.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-2 text-sm text-neutral-700 dark:text-gray-300">
                <span className="truncate">{nomDe(f.requesterId)}</span>
                <DemandeActions friendshipId={f.id} mode="repondre" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {envoyees.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
          <h2 className="mb-3 font-semibold text-[#14213D] dark:text-gray-300">
            Demandes envoyées ({envoyees.length})
          </h2>
          <ul className="space-y-3">
            {envoyees.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-2 text-sm text-neutral-700 dark:text-gray-300">
                <span className="truncate">{nomDe(f.addresseeId)}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-neutral-400 dark:text-gray-400">En attente</span>
                  <PartagerWhatsAppButton compact />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <h2 className="mb-3 font-semibold text-[#14213D] dark:text-gray-300">Mes amis ({amis.length})</h2>
        {amis.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-gray-400">Pas encore d&apos;amis.</p>
        ) : (
          <ul className="space-y-3">
            {amis.map((f) => {
              const autreId = f.requesterId === userId ? f.addresseeId : f.requesterId;
              return (
                <li key={f.id} className="flex items-center justify-between gap-2 text-sm text-neutral-700 dark:text-gray-300">
                  <span className="truncate">{nomDe(autreId)}</span>
                  <DemandeActions friendshipId={f.id} mode="supprimer" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
