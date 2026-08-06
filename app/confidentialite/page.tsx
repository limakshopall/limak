// ============================================================
//  POLITIQUE DE CONFIDENTIALITÉ  ->  /confidentialite
//  Page de départ — contenu à valider avec un professionnel du droit
//  avant publication définitive.
// ============================================================

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <main className="bg-[#FBEEDA] px-4 py-10 dark:bg-[#1c2333]">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
        >
          ← Retour à l&apos;accueil
        </Link>

        <div className="rounded-2xl border border-[#14213D]/10 bg-[#FFFBF3] p-6 shadow-sm dark:border-white/15 dark:bg-[#05070d] sm:p-8">
          <h1 className="text-2xl font-bold text-[#14213D] dark:text-gray-300">
            Politique de Confidentialité
          </h1>
          <p className="mt-4 leading-relaxed text-neutral-700 dark:text-gray-300">
            LIMAK collecte uniquement les informations nécessaires pour traiter vos commandes
            (nom, téléphone, adresse de livraison, et email si vous le renseignez). Ces données ne
            sont jamais vendues à des tiers. Cette page détaillera prochainement l&apos;usage complet
            de vos données personnelles.
          </p>
          <p className="mt-4 text-sm text-neutral-400 dark:text-gray-500">
            Contenu en cours de rédaction. Pour toute question sur vos données, contactez-nous via
            la page{" "}
            <Link href="/about" className="text-[#C95900] hover:underline">
              À propos
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
