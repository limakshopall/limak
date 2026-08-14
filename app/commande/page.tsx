// ============================================================
//  PAGE COMMANDE  ->  /commande
//  Formulaire de livraison + validation. Client Component.
// ============================================================

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useCart } from "../lib/cart-context";
import { createOrder, reverseGeocode, listerAmisAcceptes, suggestionAdresseAmi } from "./actions";

export default function CommandePage() {
  const { items, total, count, clear } = useCart();
  const router = useRouter();
  const { isSignedIn } = useUser();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Offrir à un ami
  const [amis, setAmis] = useState<{ clerkUserId: string; nom: string }[]>([]);
  const [estCadeau, setEstCadeau] = useState(false);
  const [amiChoisi, setAmiChoisi] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  useEffect(() => {
    if (!isSignedIn) return;
    listerAmisAcceptes().then(setAmis);
  }, [isSignedIn]);

  async function choisirAmi(clerkUserId: string) {
    setAmiChoisi(clerkUserId);
    if (!clerkUserId) return;
    const result = await suggestionAdresseAmi(clerkUserId);
    if (result.ok && result.suggestion) {
      setName(result.suggestion.customerName);
      setPhone(result.suggestion.customerPhone);
      setAddress(result.suggestion.shippingAddress);
    } else {
      setName("");
      setPhone("");
      setAddress("");
    }
  }

  function utiliserMaPosition() {
    if (!navigator.geolocation) {
      setLocError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        const result = await reverseGeocode(lat, lng);
        if (result.ok) {
          const lieu = [result.address, result.city].filter(Boolean).join(", ");
          if (lieu) setAddress(lieu);
        } else {
          setLocError("Position récupérée, mais l'adresse n'a pas pu être déduite — complète-la manuellement.");
        }
        setLocating(false);
      },
      () => {
        setLocError("Impossible d'obtenir ta position (permission refusée ou indisponible).");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  if (count === 0) {
    return (
      <main className="mx-auto max-w-3xl bg-[#FBEEDA] px-4 py-16 text-center dark:bg-[#1c2333]">
        <h1 className="text-2xl font-bold text-[#14213D] dark:text-gray-300">Votre panier est vide</h1>
        <Link
          href="/produits"
          className="mt-6 inline-block rounded-full bg-[#F1720A] px-6 py-3 font-semibold text-white transition hover:bg-[#C95900]"
        >
          Voir les articles
        </Link>
      </main>
    );
  }

  async function handleSubmit() {
    setError(null);
    if (estCadeau && !amiChoisi) {
      setError("Choisis l'ami à qui offrir cette commande.");
      return;
    }
    setLoading(true);
    const result = await createOrder({
      customerName: name,
      customerPhone: phone,
      customerEmail: email.trim() || undefined,
      shippingAddress: address,
      shippingCity: address,
      shippingLat: coords?.lat,
      shippingLng: coords?.lng,
      giftForClerkUserId: estCadeau ? amiChoisi : undefined,
      giftMessage: estCadeau ? giftMessage : undefined,
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
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
    <main className="mx-auto max-w-3xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <h1 className="mb-6 text-2xl font-bold text-[#14213D] dark:text-gray-300">Finaliser la commande</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulaire de livraison */}
        <div className="space-y-4 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
          <h2 className="font-semibold text-[#14213D] dark:text-gray-300">Informations de livraison</h2>

          {isSignedIn && amis.length > 0 && (
            <div className="rounded-lg border border-[#F1720A]/30 bg-[#F1720A]/5 p-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#14213D] dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={estCadeau}
                  onChange={(e) => {
                    setEstCadeau(e.target.checked);
                    if (!e.target.checked) choisirAmi("");
                  }}
                />
                🎁 Offrir cette commande à un ami
              </label>

              {estCadeau && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-sm text-neutral-600 dark:text-gray-400">Ami</label>
                    <select
                      value={amiChoisi}
                      onChange={(e) => choisirAmi(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-transparent"
                    >
                      <option value="">— Choisir —</option>
                      {amis.map((a) => (
                        <option key={a.clerkUserId} value={a.clerkUserId}>
                          {a.nom}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-neutral-400 dark:text-gray-400">
                      Coordonnées de livraison pré-remplies si ton ami a déjà commandé — vérifie-les avant d&apos;envoyer.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-600 dark:text-gray-400">Message (optionnel)</label>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-transparent"
                    />
                  </div>
                  <p className="text-xs text-[#D6293E]">
                    ⚠️ Paiement à la livraison : ton ami paiera à la réception, sauf si vous vous arrangez autrement.
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-neutral-600 dark:text-gray-400">
              {estCadeau ? "Nom complet de l'ami" : "Nom complet"}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-600 dark:text-gray-400">
              {estCadeau ? "Téléphone de l'ami" : "Téléphone"}
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-600 dark:text-gray-400">
              Email <span className="text-neutral-400">(facultatif)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Pour recevoir la confirmation et le suivi de votre commande"
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={utiliserMaPosition}
              disabled={locating}
              className="text-sm font-semibold text-[#C95900] hover:underline disabled:opacity-50"
            >
              📍 {locating ? "Localisation..." : "Utiliser ma position"}
            </button>
            {locError && <p className="mt-1 text-xs text-[#D6293E]">{locError}</p>}
            {coords && !locError && (
              <p className="mt-1 text-xs text-[#1F7A5C]">Position ajoutée à la commande.</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-neutral-600 dark:text-gray-400">
              {estCadeau
                ? "Lieu de livraison de l'ami (Ex: ville, commune, quartier)"
                : "Lieu de livraison (Ex: ville, commune, quartier)"}
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15"
            />
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="h-fit rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
          <h2 className="font-semibold text-[#14213D] dark:text-gray-300">Récapitulatif</h2>
          <div className="mt-3 space-y-2">
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between text-sm text-neutral-700 dark:text-gray-300">
                <span className="truncate">
                  {item.name}
                  {item.variantLabel && (
                    <span className="text-neutral-400 dark:text-gray-400"> ({item.variantLabel})</span>
                  )}{" "}
                  × {item.quantity}
                </span>
                <span className="whitespace-nowrap">
                  {new Intl.NumberFormat("fr-FR").format(item.price * item.quantity)} FCFA
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between border-t border-[#14213D]/10 pt-4 font-bold text-[#14213D] dark:border-white/15 dark:text-gray-300">
            <span>Total</span>
            <span>{new Intl.NumberFormat("fr-FR").format(total)} FCFA</span>
          </div>
          <p className="mt-2 text-sm text-neutral-500 dark:text-gray-400">Paiement à la livraison</p>

          {error && <p className="mt-4 text-sm font-medium text-[#D6293E]">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-6 w-full rounded-full bg-[#F1720A] px-6 py-3 font-semibold text-white transition hover:bg-[#C95900] disabled:opacity-50"
          >
            {loading ? "Validation..." : "Confirmer la commande"}
          </button>
        </div>
      </div>
    </main>
  );
}
