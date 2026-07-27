// ============================================================
//  PAGE DE CONFIRMATION  ->  /commande/merci?id=...
//  Server Component : relit la commande dans la base pour l'afficher.
// ============================================================

import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const order = id
    ? await prisma.order.findUnique({ where: { id } })
    : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Merci pour votre commande ! 🎉</h1>

      {order ? (
        <>
          <p className="mt-2 text-gray-600">
            Votre commande a bien été enregistrée. Nous vous contacterons au{" "}
            {order.customerPhone} pour la livraison.
          </p>
          <div className="mx-auto mt-6 max-w-sm rounded-lg border border-gray-200 p-4 text-left text-sm">
            <p>
              <span className="text-gray-500">Numéro :</span> {order.id}
            </p>
            <p className="mt-1">
              <span className="text-gray-500">Total :</span>{" "}
              {new Intl.NumberFormat("fr-FR").format(order.total)} FCFA
            </p>
            <p className="mt-1">
              <span className="text-gray-500">Paiement :</span> à la livraison
            </p>
            <p className="mt-1">
              <span className="text-gray-500">Livraison :</span>{" "}
              {order.customerName} — {order.shippingAddress}, {order.shippingCity}
            </p>
          </div>
        </>
      ) : (
        <p className="mt-2 text-gray-600">Votre commande a été enregistrée.</p>
      )}

      <Link
        href="/produits"
        className="mt-8 inline-block rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
      >
        Continuer mes achats
      </Link>
    </main>
  );
}
