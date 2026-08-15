// ============================================================
//  ADMIN — COMPTABILITÉ  ->  /admin/comptabilite
//  Chiffre d'affaires, bénéfice, dépenses, apports extérieurs, caisse.
// ============================================================

import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { getStatsComptables } from "./actions";
import AddDepenseForm from "./AddDepenseForm";
import DepenseRow from "./DepenseRow";
import AddApportForm from "./AddApportForm";
import ApportRow from "./ApportRow";

function fcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default async function AdminComptabilite() {
  const [stats, depenses, apports] = await Promise.all([
    getStatsComptables(),
    prisma.depense.findMany({ orderBy: { date: "desc" } }),
    prisma.apportExterieur.findMany({ orderBy: { date: "desc" } }),
  ]);

  const cartes = [
    { label: "Chiffre d'affaires", valeur: stats.chiffreAffaires, note: `${stats.nbCommandesLivrees} commande(s) livrée(s)`, couleur: "#14213D" },
    { label: "Coût d'achat total", valeur: -stats.coutAchatTotal, note: "prix fournisseur des articles vendus", couleur: "#D6293E" },
    { label: "Coût transport total", valeur: -stats.coutTransportTotal, note: "réglé par commande livrée", couleur: "#D6293E" },
    { label: "Bénéfice", valeur: stats.benefice, note: "CA − achat − transport", couleur: "#1F7A5C" },
    { label: "Apports extérieurs", valeur: stats.totalApports, note: "fonds déposés pour LIMAK", couleur: "#14213D" },
    { label: "Dépenses totales", valeur: -stats.totalDepenses, note: "achats, transport, salaires...", couleur: "#D6293E" },
    { label: "Caisse LIMAK", valeur: stats.caisse, note: "apports + CA − dépenses", couleur: "#C95900" },
  ];

  return (
    <main className="mx-auto max-w-6xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <Link
        href="/admin"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
      >
        ← Retour à l&apos;administration
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-[#14213D] dark:text-gray-300">Comptabilité</h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-gray-400">
        Le chiffre d&apos;affaires et le bénéfice sont calculés sur les commandes <strong>livrées</strong> uniquement
        (paiement à la livraison).
      </p>

      {stats.articlesSansCout > 0 && (
        <p className="mb-6 rounded-lg border border-[#F1720A]/30 bg-[#F1720A]/5 p-3 text-sm text-[#C95900]">
          ⚠️ {stats.articlesSansCout} article(s) vendu(s) sans prix d&apos;achat renseigné (variante supprimée ou{" "}
          <code>costPrice</code> vide) — le bénéfice affiché est donc légèrement surestimé.
        </p>
      )}

      {/* Cartes de synthèse */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cartes.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-gray-400">
              {c.label}
            </p>
            <p className="mt-1 text-lg font-bold" style={{ color: c.couleur }}>
              {c.valeur < 0 ? "−" : ""}
              {fcfa(Math.abs(c.valeur))}
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-400 dark:text-gray-500">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Dépenses */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold text-[#14213D] dark:text-gray-300">
          Dépenses <span className="text-sm font-normal text-neutral-400">(incl. salaires — catégorie « Salaire »)</span>
        </h2>
        <AddDepenseForm />
        <div className="mt-3 space-y-2">
          {depenses.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-gray-400">Aucune dépense enregistrée.</p>
          ) : (
            depenses.map((d) => <DepenseRow key={d.id} {...d} />)
          )}
        </div>
      </section>

      {/* Apports extérieurs */}
      <section>
        <h2 className="mb-3 text-xl font-bold text-[#14213D] dark:text-gray-300">Apports extérieurs</h2>
        <AddApportForm />
        <div className="mt-3 space-y-2">
          {apports.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-gray-400">Aucun apport enregistré.</p>
          ) : (
            apports.map((a) => <ApportRow key={a.id} {...a} />)
          )}
        </div>
      </section>
    </main>
  );
}
