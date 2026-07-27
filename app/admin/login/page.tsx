// ============================================================
//  PAGE DE CONNEXION ADMIN  ->  /admin/login
// ============================================================

import { login } from "./actions";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-sm px-4 py-20">
      <h1 className="mb-6 text-xl font-bold">Espace administrateur</h1>

      <form action={login} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600">Mot de passe</label>
          <input
            type="password"
            name="password"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">Mot de passe incorrect.</p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
        >
          Se connecter
        </button>
      </form>
    </main>
  );
}
