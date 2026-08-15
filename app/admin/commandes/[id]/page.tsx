// ============================================================
//  ADMIN — DÉTAIL D'UNE COMMANDE  ->  /admin/commandes/<id>
// ============================================================

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import OrderStatusForm from "../OrderStatusForm";
import DeleteOrderButton from "../DeleteOrderButton";

const STATUTS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default async function DetailCommande({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cmd = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!cmd) {
    notFound();
  }

  const ref = cmd.id.slice(-6).toUpperCase();

  return (
    <main className="mx-auto max-w-3xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/commandes"
          className="inline-block text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
        >
          ← Retour aux commandes
        </Link>
        <DeleteOrderButton id={cmd.id} reference={ref} />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#14213D] dark:text-gray-300">Commande n°{ref}</h1>
        <span className="rounded-full bg-[#14213D]/10 px-3 py-1 text-sm font-medium text-[#14213D]">
          {STATUTS[cmd.status] ?? cmd.status}
        </span>
      </div>

      {cmd.isGift && (
        <div className="mb-4 rounded-xl border border-[#F1720A]/30 bg-[#F1720A]/5 p-4">
          <p className="text-sm font-semibold text-[#14213D] dark:text-gray-300">
            🎁 Commande-cadeau offerte par {cmd.giftFromName ?? "un client"}
          </p>
          {cmd.giftMessage && (
            <p className="mt-1 text-sm italic text-neutral-600 dark:text-gray-400">« {cmd.giftMessage} »</p>
          )}
        </div>
      )}

      {/* Infos client / livraison */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
          <h2 className="mb-2 font-semibold text-[#14213D] dark:text-gray-300">Client</h2>
          <p className="text-sm text-neutral-800 dark:text-gray-300">{cmd.customerName}</p>
          <p className="text-sm text-neutral-600 dark:text-gray-400">{cmd.customerPhone}</p>
          {cmd.customerEmail ? (
            <p className="text-sm text-neutral-600 dark:text-gray-400">{cmd.customerEmail}</p>
          ) : (
            <p className="mt-1 text-sm font-semibold text-[#D6293E]">
              ⚠️ Pas d&apos;email — à appeler directement pour confirmer/suivre la commande.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
          <h2 className="mb-2 font-semibold text-[#14213D] dark:text-gray-300">Livraison</h2>
          <p className="text-sm text-neutral-800 dark:text-gray-300">{cmd.shippingAddress}</p>
          <p className="text-sm text-neutral-600 dark:text-gray-400">{cmd.shippingCity}</p>
          {cmd.shippingLat != null && cmd.shippingLng != null && (
            <a
              href={`https://www.google.com/maps?q=${cmd.shippingLat},${cmd.shippingLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-semibold text-[#C95900] hover:underline"
            >
              📍 Voir sur la carte
            </a>
          )}
          <p className="mt-2 text-xs text-neutral-400 dark:text-gray-400">
            Paiement à la livraison
          </p>
        </div>
      </div>

      {/* Dates */}
      <div className="mt-4 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 text-sm text-neutral-600 shadow-sm dark:border-white/15 dark:bg-[#05070d] dark:text-gray-400">
        <p>
          Passée le{" "}
          <span className="text-neutral-800 dark:text-gray-300">
            {new Date(cmd.createdAt).toLocaleString("fr-FR")}
          </span>
        </p>
        <p>
          Dernière mise à jour :{" "}
          <span className="text-neutral-800 dark:text-gray-300">
            {new Date(cmd.updatedAt).toLocaleString("fr-FR")}
          </span>
        </p>
      </div>

      {/* Articles */}
      <div className="mt-4 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <h2 className="mb-3 font-semibold text-[#14213D] dark:text-gray-300">Articles</h2>
        <div className="divide-y divide-[#14213D]/5 dark:divide-white/15">
          {cmd.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 text-sm">
              <span className="min-w-0 text-neutral-700 dark:text-gray-300">
                {item.productName}{" "}
                <span className="text-neutral-400 dark:text-gray-400">× {item.quantity}</span>
              </span>
              <span className="whitespace-nowrap font-medium text-[#14213D] dark:text-gray-300">
                {new Intl.NumberFormat("fr-FR").format(item.unitPrice * item.quantity)} FCFA
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 border-t border-[#14213D]/10 pt-3 text-sm dark:border-white/15">
          <div className="flex justify-between text-neutral-600 dark:text-gray-400">
            <span>Sous-total</span>
            <span>{new Intl.NumberFormat("fr-FR").format(cmd.subtotal)} FCFA</span>
          </div>
          <div className="flex justify-between text-neutral-600 dark:text-gray-400">
            <span>Livraison</span>
            <span>
              {cmd.shipping === 0
                ? "Gratuite"
                : `${new Intl.NumberFormat("fr-FR").format(cmd.shipping)} FCFA`}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-[#14213D] dark:text-gray-300">
            <span>Total</span>
            <span>{new Intl.NumberFormat("fr-FR").format(cmd.total)} FCFA</span>
          </div>
        </div>
      </div>

      {/* Changer le statut (envoie un email de suivi au client, si son email est connu) */}
      <div className="mt-4 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <h2 className="mb-1 font-semibold text-[#14213D] dark:text-gray-300">Statut de la commande</h2>
        <p className="mb-2 text-xs text-neutral-500 dark:text-gray-400">
          Changer le statut envoie automatiquement un email de suivi au client
          {!cmd.customerEmail && " (aucun email connu pour cette commande — rien ne sera envoyé)"}.
        </p>
        <OrderStatusForm orderId={cmd.id} currentStatus={cmd.status} />
      </div>
    </main>
  );
}