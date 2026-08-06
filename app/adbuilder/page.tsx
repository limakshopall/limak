// ============================================================
//  ADBUILDER — GALERIE DE MODÈLES  ->  /adbuilder
//  Outil interne pour créer des visuels de pub (Facebook/Insta/
//  TikTok) à partir d'une photo produit. Réservé aux comptes connectés.
// ============================================================

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { TEMPLATES } from "../lib/adbuilderStore";

export const metadata = { title: "AdBuilder" };

const COULEURS_APERCU: Record<string, string> = {
  white: "#FBEEDA",
  dore: "#C9A84C",
  bleu: "#14213D",
  orange: "#F1720A",
};

export default async function AdBuilderPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-2xl bg-[#FBEEDA] px-4 py-16 text-center dark:bg-[#1c2333]">
        <h1 className="text-2xl font-bold text-[#14213D] dark:text-gray-300">AdBuilder</h1>
        <p className="mt-2 text-neutral-500 dark:text-gray-400">
          Connecte-toi pour créer des visuels de publicité.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl bg-[#FBEEDA] px-4 py-10 dark:bg-[#1c2333]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#14213D] dark:text-gray-300">AdBuilder</h1>
        <Link
          href="/adbuilder/projets"
          className="text-sm font-semibold text-[#C95900] hover:underline"
        >
          Mes projets →
        </Link>
      </div>
      <p className="mt-1 text-sm text-neutral-500 dark:text-gray-400">
        Choisis un modèle pour créer un visuel de pub (format story 1080×1920 — Facebook, Instagram, TikTok).
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className="overflow-hidden rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] shadow-sm dark:border-white/15 dark:bg-[#05070d]"
          >
            <div
              className="flex aspect-[9/16] items-center justify-center"
              style={{ backgroundColor: COULEURS_APERCU[t.fondParDefaut] }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: t.fondParDefaut === "white" ? "#14213D" : "#FFFBF3" }}
              >
                {t.layout}
              </span>
            </div>
            <div className="p-3">
              <p className="font-semibold text-[#14213D] dark:text-gray-300">{t.nom}</p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-gray-400">{t.description}</p>
              <Link
                href={`/adbuilder/editor?template=${t.id}`}
                className="mt-3 block rounded-full bg-[#F1720A] px-3 py-1.5 text-center text-sm font-semibold text-white transition hover:bg-[#C95900]"
              >
                Utiliser
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
