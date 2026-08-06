// ============================================================
//  POLITIQUE DE RETOUR  ->  /retours
//  Page de départ — délai annoncé en footer (7 jours), contenu
//  détaillé à valider avant publication définitive.
// ============================================================

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Retour",
};

export default function RetoursPage() {
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
            Politique de Retour
          </h1>
          <p className="mt-4 leading-relaxed text-neutral-700 dark:text-gray-300">
            Vous disposez de <strong>7 jours</strong> après réception de votre commande pour signaler
            un problème (article non conforme, défectueux). Contactez-nous par WhatsApp ou email
            avec votre numéro de commande. Cette page détaillera prochainement la procédure complète
            de retour et de remboursement.
          </p>
          <p className="mt-4 text-sm text-neutral-400 dark:text-gray-500">
            Contenu en cours de rédaction. Pour lancer un retour, contactez-nous via la page{" "}
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
