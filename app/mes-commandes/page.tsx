// ============================================================
//  PAGE "MES COMMANDES"  ->  /mes-commandes
//  Réservée au client connecté : son historique de commandes.
// ============================================================

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../lib/prisma";
import AnnulerCommandeButton from "./AnnulerCommandeButton";

const STATUTS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default async function MesCommandes() {
  const { userId } = await auth();

  // Si pas connecté : message + invitation à se connecter
  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Mes commandes</h1>
        <p className="mt-2 text-neutral-500 dark:text-gray-400">
          Connectez-vous pour voir l&apos;historique de vos commandes.
        </p>
        <Link
          href="/produits"
          className="mt-6 inline-block rounded-full bg-[#F1720A] px-6 py-3 font-semibold text-white hover:bg-[#C95900]"
        >
          Voir la boutique
        </Link>
      </main>
    );
  }

  // Les commandes de ce client (y compris celles qu'il a offertes)
  const commandes = await prisma.order.findMany({
    where: { clerkUserId: userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  // Cadeaux que des amis lui ont offerts — prix caché, c'est une surprise !
  const cadeauxRecus = await prisma.order.findMany({
    where: { giftForClerkUserId: userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold">Mes commandes</h1>

      {cadeauxRecus.length > 0 && (
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-[#14213D] dark:text-gray-300">
            🎁 Cadeaux reçus ({cadeauxRecus.length})
          </h2>
          {cadeauxRecus.map((cadeau) => (
            <div
              key={cadeau.id}
              className="rounded-lg border border-[#F1720A]/30 bg-[#F1720A]/5 p-4"
            >
              <p className="text-sm font-semibold text-[#14213D] dark:text-gray-300">
                De la part de {cadeau.giftFromName ?? "un ami"}
              </p>
              {cadeau.giftMessage && (
                <p className="mt-1 text-sm italic text-neutral-600 dark:text-gray-400">
                  « {cadeau.giftMessage} »
                </p>
              )}
              <span className="mt-2 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-white/10 dark:text-gray-300">
                {STATUTS[cadeau.status] ?? cadeau.status}
              </span>
              <div className="mt-3 border-t border-[#14213D]/10 pt-3 text-sm text-neutral-600 dark:border-white/15 dark:text-gray-400">
                {cadeau.items.map((item) => (
                  <div key={item.id}>
                    {item.productName} × {item.quantity}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-400 dark:text-gray-400">
                Prix gardé secret 🤫 — livraison : {cadeau.shippingAddress}
              </p>
            </div>
          ))}
        </div>
      )}

      {commandes.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center dark:border-white/15 dark:bg-[#05070d]">
          <p className="text-neutral-500 dark:text-gray-400">
            Vous n&apos;avez pas encore passé de commande.
          </p>
          <Link
            href="/produits"
            className="mt-4 inline-block rounded-full bg-[#F1720A] px-6 py-3 font-semibold text-white hover:bg-[#C95900]"
          >
            Découvrir les articles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {commandes.map((cmd) => (
            <div
              key={cmd.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-white/15 dark:bg-[#05070d]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-neutral-400 dark:text-gray-400">
                    {new Date(cmd.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-white/10 dark:text-gray-300">
                    {STATUTS[cmd.status] ?? cmd.status}
                  </span>
                  {cmd.isGift && (
                    <span className="ml-2 mt-1 inline-block rounded-full bg-[#F1720A]/10 px-3 py-1 text-xs font-medium text-[#C95900]">
                      🎁 Offert à un ami
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold">
                  {new Intl.NumberFormat("fr-FR").format(cmd.total)} FCFA
                </p>
              </div>

              <div className="mt-3 border-t border-neutral-100 pt-3 text-sm text-neutral-600 dark:border-white/15 dark:text-gray-400">
                {cmd.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span>
                      {new Intl.NumberFormat("fr-FR").format(
                        item.unitPrice * item.quantity
                      )}{" "}
                      FCFA
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs text-neutral-400 dark:text-gray-400">
                Livraison : {cmd.shippingAddress}, {cmd.shippingCity} · Paiement à
                la livraison
              </p>

              {cmd.status === "PENDING" && <AnnulerCommandeButton orderId={cmd.id} />}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
