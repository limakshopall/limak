// ============================================================
//  ACCUEIL DE L'ADMIN  ->  /admin
//  Tableau de bord : statistiques + accès rapides.
//  (protégé par le middleware)
// ============================================================

import Link from "next/link";
import { prisma } from "../lib/prisma";
import { logout } from "./login/actions";

// On ne veut jamais de version "en cache" : les chiffres doivent être frais.
export const dynamic = "force-dynamic";

// Petit utilitaire d'affichage des montants en FCFA.
function fcfa(montant: number) {
  return new Intl.NumberFormat("fr-FR").format(montant) + " FCFA";
}

export default async function AdminHome() {
  // Début de la journée d'aujourd'hui (minuit).
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);

  // On lance toutes les requêtes en parallèle (plus rapide).
  const [
    caTotalAgg,
    caJourAgg,
    commandesJour,
    commandesEnAttente,
    dernieresCommandes,
    topVentes,
  ] = await Promise.all([
    // Chiffre d'affaires total (hors commandes annulées)
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    // Chiffre d'affaires du jour (hors annulées)
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: debutJour } },
    }),
    // Nombre de commandes aujourd'hui (hors annulées)
    prisma.order.count({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: debutJour } },
    }),
    // Commandes en attente de traitement
    prisma.order.count({ where: { status: "PENDING" } }),
    // 5 dernières commandes
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    // Top 5 des produits les plus vendus (par quantité)
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const caTotal = caTotalAgg._sum.total ?? 0;
  const caJour = caJourAgg._sum.total ?? 0;

  // Les cartes de chiffres clés
  const stats = [
    { label: "Commandes aujourd'hui", valeur: String(commandesJour) },
    { label: "Chiffre d'affaires du jour", valeur: fcfa(caJour) },
    { label: "Commandes en attente", valeur: String(commandesEnAttente) },
    { label: "Chiffre d'affaires total", valeur: fcfa(caTotal) },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Administration</h1>
        <form action={logout}>
          <button className="text-sm text-gray-500 hover:text-black">
            Se déconnecter
          </button>
        </form>
      </div>

      {/* --- Cartes de statistiques --- */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-xl font-bold">{s.valeur}</p>
          </div>
        ))}
      </div>

      {/* --- Dernières commandes + Top ventes --- */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Dernières commandes */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Dernières commandes</h2>
            <Link
              href="/admin/commandes"
              className="text-sm text-gray-500 hover:text-black"
            >
              Tout voir →
            </Link>
          </div>

          {dernieresCommandes.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune commande.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {dernieresCommandes.map((cmd) => (
                <li
                  key={cmd.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{cmd.customerName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(cmd.createdAt).toLocaleDateString("fr-FR")} ·{" "}
                      {cmd.items.length} article(s)
                    </p>
                  </div>
                  <span className="whitespace-nowrap font-semibold">
                    {fcfa(cmd.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top ventes */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Meilleures ventes</h2>

          {topVentes.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune vente pour le moment.</p>
          ) : (
            <ol className="space-y-2">
              {topVentes.map((p, i) => (
                <li
                  key={p.productName}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="min-w-0 truncate">
                    <span className="text-gray-400">{i + 1}.</span>{" "}
                    {p.productName}
                  </span>
                  <span className="whitespace-nowrap font-semibold">
                    {p._sum.quantity ?? 0} vendu(s)
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* --- Accès rapides (tes cartes d'origine) --- */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/commandes"
          className="rounded-lg border border-gray-200 p-6 transition hover:shadow-md"
        >
          <h2 className="font-semibold">Commandes</h2>
          <p className="mt-1 text-sm text-gray-500">
            Voir et gérer les commandes reçues
          </p>
        </Link>

        <Link
          href="/admin/produits"
          className="rounded-lg border border-gray-200 p-6 transition hover:shadow-md"
        >
          <h2 className="font-semibold">Produits</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérer le catalogue et les stocks
          </p>
        </Link>
      </div>
    </main>
  );
}