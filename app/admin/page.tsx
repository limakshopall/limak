// ============================================================
//  ACCUEIL DE L'ADMIN  ->  /admin
//  Tableau de bord : statistiques + alerte stock + accès rapides.
//  (protégé par le middleware)
// ============================================================

import Link from "next/link";
import { prisma } from "../lib/prisma";
import { logout } from "./login/actions";

export const dynamic = "force-dynamic";

// Seuil en dessous duquel on considère le stock "bas".
const SEUIL_STOCK_BAS = 3;

function fcfa(montant: number) {
  return new Intl.NumberFormat("fr-FR").format(montant) + " FCFA";
}

export default async function AdminHome() {
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);

  const [
    caTotalAgg,
    caJourAgg,
    commandesJour,
    commandesEnAttente,
    dernieresCommandes,
    topVentes,
    stockBas,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: debutJour } },
    }),
    prisma.order.count({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: debutJour } },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    // Variantes à stock bas (<= seuil), triées du plus bas au plus haut
    prisma.productVariant.findMany({
      where: { stock: { lte: SEUIL_STOCK_BAS } },
      orderBy: { stock: "asc" },
      include: { product: { select: { name: true, slug: true } } },
    }),
  ]);

  const caTotal = caTotalAgg._sum.total ?? 0;
  const caJour = caJourAgg._sum.total ?? 0;

  const stats = [
    { label: "Commandes aujourd'hui", valeur: String(commandesJour) },
    { label: "Chiffre d'affaires du jour", valeur: fcfa(caJour) },
    { label: "Commandes en attente", valeur: String(commandesEnAttente) },
    { label: "Chiffre d'affaires total", valeur: fcfa(caTotal) },
  ];

  return (
    <main className="mx-auto max-w-4xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#14213D] dark:text-gray-300">Administration</h1>
        <form action={logout}>
          <button className="text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400">
            Se déconnecter
          </button>
        </form>
      </div>

      {/* --- Cartes de statistiques --- */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]"
          >
            <p className="text-sm text-neutral-500 dark:text-gray-400">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-[#14213D] dark:text-gray-300">{s.valeur}</p>
          </div>
        ))}
      </div>

      {/* --- Alerte de stock bas --- */}
      {stockBas.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#F1720A]/20 bg-[#F1720A]/5 p-4">
          <h2 className="font-semibold text-[#C95900]">
            ⚠️ Stock à surveiller ({stockBas.length})
          </h2>
          <p className="mb-3 mt-1 text-sm text-[#C95900]/80">
            Ces articles sont épuisés ou bientôt en rupture.
          </p>
          <ul className="divide-y divide-[#F1720A]/10">
            {stockBas.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-2 text-sm">
                <Link
                  href={`/produits/${v.product.slug}`}
                  className="min-w-0 truncate font-medium text-[#14213D] hover:underline"
                >
                  {v.product.name}
                  {v.name !== "Standard" && (
                    <span className="text-[#C95900]"> · {v.name}</span>
                  )}
                </Link>
                <span
                  className={`ml-3 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${
                    v.stock === 0
                      ? "bg-[#D6293E]/10 text-[#D6293E]"
                      : "bg-[#F1720A]/15 text-[#C95900]"
                  }`}
                >
                  {v.stock === 0 ? "Épuisé" : `${v.stock} restant(s)`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- Dernières commandes + Top ventes --- */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-[#14213D] dark:text-gray-300">Dernières commandes</h2>
            <Link
              href="/admin/commandes"
              className="text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
            >
              Tout voir →
            </Link>
          </div>

          {dernieresCommandes.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-gray-400">Aucune commande.</p>
          ) : (
            <ul className="divide-y divide-[#14213D]/5 dark:divide-white/15">
              {dernieresCommandes.map((cmd) => (
                <li
                  key={cmd.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#14213D] dark:text-gray-300">{cmd.customerName}</p>
                    <p className="text-xs text-neutral-400 dark:text-gray-400">
                      {new Date(cmd.createdAt).toLocaleDateString("fr-FR")} ·{" "}
                      {cmd.items.length} article(s)
                    </p>
                  </div>
                  <span className="whitespace-nowrap font-semibold text-[#14213D] dark:text-gray-300">
                    {fcfa(cmd.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
          <h2 className="mb-3 font-semibold text-[#14213D] dark:text-gray-300">Meilleures ventes</h2>

          {topVentes.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-gray-400">Aucune vente pour le moment.</p>
          ) : (
            <ol className="space-y-2">
              {topVentes.map((p, i) => (
                <li
                  key={p.productName}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="min-w-0 truncate text-neutral-700 dark:text-gray-300">
                    <span className="text-neutral-400 dark:text-gray-400">{i + 1}.</span>{" "}
                    {p.productName}
                  </span>
                  <span className="whitespace-nowrap font-semibold text-[#14213D] dark:text-gray-300">
                    {p._sum.quantity ?? 0} vendu(s)
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* --- Accès rapides --- */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/commandes"
          className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-6 shadow-sm transition hover:shadow-md dark:border-white/15 dark:bg-[#05070d]"
        >
          <h2 className="font-semibold text-[#14213D] dark:text-gray-300">Commandes</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-gray-400">
            Voir et gérer les commandes reçues
          </p>
        </Link>

        <Link
          href="/admin/produits"
          className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-6 shadow-sm transition hover:shadow-md dark:border-white/15 dark:bg-[#05070d]"
        >
          <h2 className="font-semibold text-[#14213D] dark:text-gray-300">Articles</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-gray-400">
            Gérer le catalogue et les stocks
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-6 shadow-sm transition hover:shadow-md dark:border-white/15 dark:bg-[#05070d]"
        >
          <h2 className="font-semibold text-[#14213D] dark:text-gray-300">Catégories</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-gray-400">
            Ajouter/changer la photo de chaque catégorie
          </p>
        </Link>

        <Link
          href="/admin/carrousel"
          className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-6 shadow-sm transition hover:shadow-md dark:border-white/15 dark:bg-[#05070d]"
        >
          <h2 className="font-semibold text-[#14213D] dark:text-gray-300">Carrousel d&apos;accueil</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-gray-400">
            Diapositives, taille et vitesse de défilement
          </p>
        </Link>
      </div>
    </main>
  );
}