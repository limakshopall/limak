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
    <main className="mx-auto max-w-5xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <Link
        href="/admin"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
      >
        ← Retour à l&apos;administration
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-[#14213D] dark:text-gray-300">Commandes</h1>

      <CommandesFiltres />

      {commandes.length === 0 ? (
        <p className="text-neutral-500 dark:text-gray-400">Aucune commande ne correspond.</p>
      ) : (
        <div className="space-y-3">
          {commandes.map((cmd) => (
            <div
              key={cmd.id}
              className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#14213D] dark:text-gray-300">
                    {cmd.customerName}
                    {!cmd.customerEmail && (
                      <span
                        title="Pas d'email — à appeler directement"
                        className="ml-1.5 rounded-full bg-[#D6293E]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#D6293E]"
                      >
                        ⚠️ Pas d&apos;email
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-gray-400">{cmd.customerPhone}</p>
                  <p className="text-sm text-neutral-500 dark:text-gray-400">
                    {cmd.shippingAddress}, {cmd.shippingCity}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400 dark:text-gray-400">
                    {new Date(cmd.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-[#14213D] dark:text-gray-300">
                    {new Intl.NumberFormat("fr-FR").format(cmd.total)} FCFA
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-gray-400">
                    {cmd.items.length} article(s)
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-gray-400">Paiement à la livraison</p>
                </div>
              </div>

              <div className="mt-3 border-t border-[#14213D]/10 pt-3 text-sm text-neutral-600 dark:border-white/15 dark:text-gray-400">
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

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#14213D]/10 pt-3 dark:border-white/15">
                <OrderStatusForm orderId={cmd.id} currentStatus={cmd.status} />
                <Link
                  href={`/admin/commandes/${cmd.id}`}
                  className="whitespace-nowrap text-sm font-medium text-[#C95900] hover:underline"
                >
                  Voir le détail →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}