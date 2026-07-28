// ============================================================
//  PAGE "MES COMMANDES"  ->  /mes-commandes
//  Réservée au client connecté : son historique de commandes.
// ============================================================

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../lib/prisma";

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
        <p className="mt-2 text-neutral-500">
          Connectez-vous pour voir l&apos;historique de vos commandes.
        </p>
        <Link
          href="/produits"
          className="mt-6 inline-block rounded-full bg-[#e67e22] px-6 py-3 font-semibold text-white hover:bg-[#d35400]"
        >
          Voir la boutique
        </Link>
      </main>
    );
  }

  // Les commandes de ce client
  const commandes = await prisma.order.findMany({
    where: { clerkUserId: userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold">Mes commandes</h1>

      {commandes.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
          <p className="text-neutral-500">
            Vous n&apos;avez pas encore passé de commande.
          </p>
          <Link
            href="/produits"
            className="mt-4 inline-block rounded-full bg-[#e67e22] px-6 py-3 font-semibold text-white hover:bg-[#d35400]"
          >
            Découvrir les produits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {commandes.map((cmd) => (
            <div
              key={cmd.id}
              className="rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-neutral-400">
                    {new Date(cmd.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                    {STATUTS[cmd.status] ?? cmd.status}
                  </span>
                </div>
                <p className="text-lg font-bold">
                  {new Intl.NumberFormat("fr-FR").format(cmd.total)} FCFA
                </p>
              </div>

              <div className="mt-3 border-t border-neutral-100 pt-3 text-sm text-neutral-600">
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

              <p className="mt-3 text-xs text-neutral-400">
                Livraison : {cmd.shippingAddress}, {cmd.shippingCity} · Paiement à
                la livraison
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
