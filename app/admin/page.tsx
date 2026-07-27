// ============================================================
//  ACCUEIL DE L'ADMIN  ->  /admin
//  (protégé par le middleware)
// ============================================================

import Link from "next/link";
import { logout } from "./login/actions";

export default function AdminHome() {
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
