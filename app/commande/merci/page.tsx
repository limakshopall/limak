// ============================================================
//  PAGE DE CONFIRMATION  ->  /commande/merci?id=...
//  Server Component : relit la commande dans la base pour l'afficher.
// ============================================================

import Link from "next/link";
import { prisma } from "../../lib/prisma";
import PurchasePixel from "../../components/PurchasePixel";

export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const order = id
    ? await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { variant: { select: { productId: true } } } } },
      })
    : null;

  // Ids produits (uniques) des articles achetés — pour l'événement Purchase.
  const contentIds = order
    ? Array.from(new Set(order.items.map((i) => i.variant?.productId).filter((v): v is string => !!v)))
    : [];

  return (
    <main className="mx-auto max-w-2xl bg-[#FBEEDA] px-4 py-16 text-center dark:bg-[#1c2333]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1F7A5C]/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="#1F7A5C" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h1 className="mt-4 text-2xl font-bold text-[#14213D] dark:text-gray-300">Merci pour votre commande !</h1>

      {order && <PurchasePixel orderId={order.id} value={order.total} contentIds={contentIds} />}

      {order ? (
        <>
          <p className="mt-2 text-neutral-600 dark:text-gray-400">
            Votre commande a bien été enregistrée. Nous vous contacterons au{" "}
            {order.customerPhone} pour la livraison.
          </p>
          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 text-left text-sm shadow-sm dark:border-white/15 dark:bg-[#05070d]">
            <p>
              <span className="text-neutral-500 dark:text-gray-400">Numéro :</span> {order.id}
            </p>
            <p className="mt-1">
              <span className="text-neutral-500 dark:text-gray-400">Total :</span>{" "}
              {new Intl.NumberFormat("fr-FR").format(order.total)} FCFA
            </p>
            <p className="mt-1">
              <span className="text-neutral-500 dark:text-gray-400">Paiement :</span> à la livraison
            </p>
            <p className="mt-1">
              <span className="text-neutral-500 dark:text-gray-400">Livraison :</span>{" "}
              {order.customerName} — {order.shippingAddress}, {order.shippingCity}
            </p>
          </div>
        </>
      ) : (
        <p className="mt-2 text-neutral-600 dark:text-gray-400">Votre commande a été enregistrée.</p>
      )}

      <Link
        href="/produits"
        className="mt-8 inline-block rounded-full bg-[#F1720A] px-6 py-3 font-semibold text-white transition hover:bg-[#C95900]"
      >
        Continuer mes achats
      </Link>
    </main>
  );
}
