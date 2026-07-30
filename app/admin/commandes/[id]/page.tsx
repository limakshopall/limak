// ============================================================
//  ADMIN — DÉTAIL D'UNE COMMANDE  ->  /admin/commandes/<id>
// ============================================================

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import OrderStatusForm from "../OrderStatusForm";

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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/admin/commandes"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-800"
      >
        ← Retour aux commandes
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Commande n°{ref}</h1>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {STATUTS[cmd.status] ?? cmd.status}
        </span>
      </div>

      {/* Infos client / livraison */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 font-semibold">Client</h2>
          <p className="text-sm">{cmd.customerName}</p>
          <p className="text-sm text-gray-600">{cmd.customerPhone}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 font-semibold">Livraison</h2>
          <p className="text-sm">{cmd.shippingAddress}</p>
          <p className="text-sm text-gray-600">{cmd.shippingCity}</p>
          <p className="mt-2 text-xs text-gray-400">
            Paiement à la livraison
          </p>
        </div>
      </div>

      {/* Dates */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <p>
          Passée le{" "}
          <span className="text-gray-800">
            {new Date(cmd.createdAt).toLocaleString("fr-FR")}
          </span>
        </p>
        <p>
          Dernière mise à jour :{" "}
          <span className="text-gray-800">
            {new Date(cmd.updatedAt).toLocaleString("fr-FR")}
          </span>
        </p>
      </div>

      {/* Articles */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 font-semibold">Articles</h2>
        <div className="divide-y divide-gray-100">
          {cmd.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2 text-sm">
              <span className="min-w-0">
                {item.productName}{" "}
                <span className="text-gray-400">× {item.quantity}</span>
              </span>
              <span className="whitespace-nowrap font-medium">
                {new Intl.NumberFormat("fr-FR").format(item.unitPrice * item.quantity)} FCFA
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span>{new Intl.NumberFormat("fr-FR").format(cmd.subtotal)} FCFA</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Livraison</span>
            <span>
              {cmd.shipping === 0
                ? "Gratuite"
                : `${new Intl.NumberFormat("fr-FR").format(cmd.shipping)} FCFA`}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{new Intl.NumberFormat("fr-FR").format(cmd.total)} FCFA</span>
          </div>
        </div>
      </div>

      {/* Changer le statut (envoie le SMS de suivi au client) */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-1 font-semibold">Statut de la commande</h2>
        <p className="mb-2 text-xs text-gray-500">
          Changer le statut envoie automatiquement un SMS au client.
        </p>
        <OrderStatusForm orderId={cmd.id} currentStatus={cmd.status} />
      </div>
    </main>
  );
}