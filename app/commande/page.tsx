// ============================================================
//  PAGE COMMANDE  ->  /commande
//  Formulaire de livraison + validation. Client Component.
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../lib/cart-context";
import { createOrder } from "./actions";

export default function CommandePage() {
  const { items, total, count, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (count === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Votre panier est vide</h1>
        <Link
          href="/produits"
          className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
        >
          Voir les produits
        </Link>
      </main>
    );
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    const result = await createOrder({
      customerName: name,
      customerPhone: phone,
      shippingAddress: address,
      shippingCity: city,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    clear(); // on vide le panier
    router.push(`/commande/merci?id=${result.orderId}`); // page de confirmation
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold">Finaliser la commande</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Formulaire de livraison */}
        <div className="space-y-4">
          <h2 className="font-semibold">Informations de livraison</h2>

          <div>
            <label className="block text-sm text-gray-600">Nom complet</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Téléphone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Adresse</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Ville</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {/* Récapitulatif */}
        <div>
          <h2 className="font-semibold">Récapitulatif</h2>
          <div className="mt-3 space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="truncate">
                  {item.name} × {item.quantity}
                </span>
                <span className="whitespace-nowrap">
                  {new Intl.NumberFormat("fr-FR").format(item.price * item.quantity)} FCFA
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 font-bold">
            <span>Total</span>
            <span>{new Intl.NumberFormat("fr-FR").format(total)} FCFA</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Paiement à la livraison</p>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Validation..." : "Confirmer la commande"}
          </button>
        </div>
      </div>
    </main>
  );
}
