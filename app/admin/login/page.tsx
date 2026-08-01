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
    <main className="mx-auto flex min-h-[80vh] max-w-sm items-center px-4">
      <div className="w-full rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-6 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <h1 className="mb-6 text-xl font-bold text-[#14213D] dark:text-gray-300">Espace administrateur</h1>

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-600 dark:text-gray-400">Mot de passe</label>
            <input
              type="password"
              name="password"
              className="mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-[#D6293E]">Mot de passe incorrect.</p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-[#F1720A] px-6 py-3 font-semibold text-white transition hover:bg-[#C95900]"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}
