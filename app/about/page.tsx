// ============================================================
//  À PROPOS DE LIMAK  ->  /about
//  Présentation du fondateur (Abdallah Thera) + pourquoi faire
//  confiance à LIMAK. Page statique, sans données de la base.
// ============================================================

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez qui se cache derrière LIMAK et pourquoi faire confiance à la boutique : sélection rigoureuse, prix justes, service local en Côte d'Ivoire.",
};

const NUMERO_WHATSAPP = "2250717678784"; // +225 07 17 67 87 84
const MESSAGE_WHATSAPP = "Bonjour LIMAK, j'ai une question.";

const ATOUTS = [
  {
    titre: "Sélection rigoureuse",
    description: "Chaque produit est validé pour sa qualité.",
  },
  {
    titre: "Prix justes",
    description: "Pas d'intermédiaires inutiles.",
  },
  {
    titre: "Service local",
    description: "Nous comprenons vos besoins d'Ivoiriens.",
  },
  {
    titre: "Livraison rapide",
    description: "Partout en Côte d'Ivoire en 2-3 jours.",
  },
  {
    titre: "Paiement à la livraison",
    description: "Aucun risque, payez à la réception.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#FBEEDA] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        {/* --- HEADER --- */}
        <header className="text-center">
          <h1 className="text-2xl font-extrabold uppercase tracking-wide text-[#14213D] sm:text-3xl">
            À propos de LIMAK
          </h1>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-[#E8C255]" aria-hidden />
        </header>

        {/* --- QUI SUIS-JE ? --- */}
        <section className="mt-10 rounded-2xl border border-[#14213D]/10 bg-[#FFFBF3] p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#14213D] sm:text-2xl">Qui suis-je ?</h2>
          <p className="mt-4 leading-relaxed text-neutral-700">
            Je m&apos;appelle Abdallah Thera. Je suis né et j&apos;ai grandi à Abidjan, où j&apos;ai
            suivi un parcours académique dans les plus prestigieuses institutions de Côte d&apos;Ivoire :
            le Groupe Scolaire Yobou-Lambert, le Collège Moderne d&apos;Autoroute Treichville, le Lycée
            Classique d&apos;Abidjan, et actuellement à l&apos;INPHB de Yamoussoukro — la meilleure école
            de Côte d&apos;Ivoire et l&apos;une des meilleures d&apos;Afrique.
          </p>
        </section>

        {/* --- POURQUOI LIMAK ? --- */}
        <section className="mt-6 rounded-2xl border border-[#14213D]/10 bg-[#FFFBF3] p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#14213D] sm:text-2xl">Pourquoi LIMAK ?</h2>
          <div className="mt-4 space-y-4 leading-relaxed text-neutral-700">
            <p>
              C&apos;est en pensant à faciliter la vie quotidienne des Ivoiriens que j&apos;ai créé
              LIMAK. Trop souvent, la qualité rime avec prix inaccessible.
            </p>
            <p>
              LIMAK est dédié à une mission simple : vous permettre d&apos;accéder à des produits de
              qualité premium à des prix abordables, avec un service irréprochable.
            </p>
            <p>
              Que ce soit des chaussures de luxe, des accessoires traditionnels, ou des articles du
              quotidien — chaque produit est sélectionné avec soin pour vous garantir la meilleure
              valeur.
            </p>
          </div>
        </section>

        {/* --- POURQUOI NOUS FAIRE CONFIANCE ? --- */}
        <section className="mt-6 rounded-2xl border border-[#14213D]/10 bg-[#FFFBF3] p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-[#14213D] sm:text-2xl">
            Pourquoi nous faire confiance ?
          </h2>
          <ul className="mt-4 space-y-3">
            {ATOUTS.map((atout) => (
              <li
                key={atout.titre}
                className="flex items-start gap-3 rounded-xl bg-[#FBEEDA] p-3 sm:p-4"
              >
                <span aria-hidden className="text-lg leading-none">
                  ✅
                </span>
                <div>
                  <p className="font-semibold text-[#14213D]">{atout.titre}</p>
                  <p className="text-sm text-neutral-600">{atout.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* --- NOUS CONTACTER --- */}
        <section className="mt-6 rounded-2xl border border-[#14213D]/10 bg-[#14213D] p-6 text-center shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Nous contacter</h2>
          <p className="mt-2 text-sm text-white/70">
            Une question avant de commander ? Écrivez-nous directement.
          </p>
          <a
            href={`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(MESSAGE_WHATSAPP)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#E8C255] px-6 py-3 font-semibold text-[#14213D] transition hover:bg-[#f0d27a]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.21h.005c5.46 0 9.9-4.45 9.9-9.92C21.95 6.45 17.5 2 12.04 2zm5.83 14.19c-.245.69-1.42 1.32-1.96 1.4-.5.08-1.13.11-1.82-.11-.42-.13-.96-.32-1.65-.62-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2.01.89 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.25 1.62 2.02 1.11 1 2.05 1.31 2.34 1.46.29.15.46.13.63-.08.17-.21.72-.85.92-1.14.19-.29.38-.24.65-.14.27.1 1.68.79 1.97.94.29.15.48.22.55.34.07.13.07.75-.17 1.44z" />
            </svg>
            {NUMERO_WHATSAPP.replace(/^225(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, "+225 $1 $2 $3 $4 $5")}
          </a>
        </section>

        {/* --- FOOTER SIMPLE --- */}
        <footer className="mt-10 text-center">
          <Link
            href="/"
            className="inline-block text-sm font-medium text-[#14213D] hover:text-[#C95900] hover:underline"
          >
            ← Retour à l&apos;accueil
          </Link>
          <p className="mt-3 text-xs text-neutral-400">
            © {new Date().getFullYear()} LIMAK. Tous droits réservés.
          </p>
        </footer>
      </div>
    </main>
  );
}
