// ============================================================
//  ADMIN — CARROUSEL D'ACCUEIL  ->  /admin/carrousel
// ============================================================

import Link from "next/link";
import { prisma } from "../../lib/prisma";
import SlideList from "./SlideList";
import SlideForm from "./SlideForm";
import SettingsForm from "./SettingsForm";

export default async function AdminCarrousel() {
  const [slides, settings] = await Promise.all([
    prisma.heroSlide.findMany({ orderBy: { position: "asc" } }),
    prisma.heroSettings.findFirst(),
  ]);

  return (
    <main className="mx-auto max-w-2xl bg-[#FBEEDA] px-4 py-8 dark:bg-[#1c2333]">
      <Link
        href="/admin"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
      >
        ← Retour à l&apos;administration
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-[#14213D] dark:text-gray-300">Carrousel d&apos;accueil</h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-gray-400">
        Diapositives affichées en haut de l&apos;accueil, taille et vitesse de défilement.
      </p>

      <div className="mb-8 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <h2 className="mb-3 font-semibold text-[#14213D] dark:text-gray-300">Style et taille</h2>
        <SettingsForm heightVh={settings?.heightVh ?? 45} slideDuration={settings?.slideDuration ?? 5000} />
      </div>

      <div className="rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]">
        <h2 className="mb-3 font-semibold text-[#14213D] dark:text-gray-300">Diapositives</h2>
        <SlideList slides={slides} />
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-gray-400">+ Ajouter une diapositive</p>
          <SlideForm />
        </div>
      </div>
    </main>
  );
}
