// ============================================================
//  ADMIN — LISTE DES COMMANDES  ->  /admin/commandes
//  Avec recherche (nom / téléphone) + filtre par statut.
// ============================================================

import Link from "next/link";
import { prisma } from "../../lib/prisma";
import OrderStatusForm from "./OrderStatusForm";
import CommandesFiltres from "./CommandesFiltres";

export default async function AdminCommandes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; statut?: string }>;
}) {
  const { q, statut } = await searchParams;

  const statutsValides = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

  const commandes = await prisma.order.findMany({
    where: {
      // Filtre statut (seulement si valide)
      ...(statut && statutsValides.includes(statut)
        ? { status: statut as "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" }
        : {}),
      // Recherche sur le nom OU le téléphone du client
      ...(q
        ? {
            OR: [
              { customerName: { contains: q, mode: "insensitive" as const } },
              { customerPhone: { contains: q } },
            ],
          }
        : {}),
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/admin"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-800"
      >
        ← Retour à l'administration
      </Link>

      <h1 className="mb-8 text-2xl font-bold">Commandes</h1>

      <CommandesFiltres />

      {commandes.length === 0 ? (
        <p className="text-gray-500">Aucune commande ne correspond.</p>
      ) : (
        <div className="space-y-4">
          {commandes.map((cmd) => (
            <div
              key={cmd.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{cmd.customerName}</p>
                  <p className="text-sm text-gray-500">{cmd.customerPhone}</p>
                  <p className="text-sm text-gray-500">
                    {cmd.shippingAddress}, {cmd.shippingCity}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(cmd.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold">
                    {new Intl.NumberFormat("fr-FR").format(cmd.total)} FCFA
                  </p>
                  <p className="text-sm text-gray-500">
                    {cmd.items.length} article(s)
                  </p>
                  <p className="text-xs text-gray-400">Paiement à la livraison</p>
                </div>
              </div>

              <div className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
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

              <OrderStatusForm orderId={cmd.id} currentStatus={cmd.status} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}