// ============================================================
//  ADBUILDER — MES PROJETS  ->  /adbuilder/projets
//  Liste les visuels enregistrés (localStorage), permet de les
//  rouvrir dans l'éditeur ou de les supprimer.
// ============================================================

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { listerProjets, supprimerProjet, getTemplate, type Projet } from "../../lib/adbuilderStore";

export default function MesProjetsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [projets, setProjets] = useState<Projet[] | null>(null);

  useEffect(() => {
    // localStorage n'existe pas côté serveur : lecture après le montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProjets(listerProjets());
  }, []);

  function handleSupprimer(id: string) {
    const ok = window.confirm("Supprimer ce projet ?");
    if (!ok) return;
    supprimerProjet(id);
    setProjets(listerProjets());
  }

  if (isLoaded && !isSignedIn) {
    return (
      <main className="mx-auto max-w-2xl bg-[#FBEEDA] px-4 py-16 text-center dark:bg-[#1c2333]">
        <h1 className="text-2xl font-bold text-[#14213D] dark:text-gray-300">Mes projets</h1>
        <p className="mt-2 text-neutral-500 dark:text-gray-400">Connecte-toi pour voir tes projets.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl bg-[#FBEEDA] px-4 py-10 dark:bg-[#1c2333]">
      <Link
        href="/adbuilder"
        className="mb-4 inline-block text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400"
      >
        ← Retour aux modèles
      </Link>
      <h1 className="text-2xl font-bold text-[#14213D] dark:text-gray-300">Mes projets</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-gray-400">
        Enregistrés dans ce navigateur uniquement (pas sur le serveur).
      </p>

      {projets === null ? null : projets.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500 dark:text-gray-400">
          Aucun projet enregistré pour l&apos;instant.{" "}
          <Link href="/adbuilder" className="text-[#C95900] hover:underline">
            Créer un visuel
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {projets.map((p) => {
            const template = getTemplate(p.templateId);
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] shadow-sm dark:border-white/15 dark:bg-[#05070d]"
              >
                <div className="relative flex aspect-[9/16] items-center justify-center bg-[#14213D]/5">
                  {p.imageDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageDataUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-2 text-center text-xs text-neutral-400">Pas de photo</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate font-semibold text-[#14213D] dark:text-gray-300">{p.nom || p.titre}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-gray-400">
                    {template.nom} · {new Date(p.creeLe).toLocaleDateString("fr-FR")}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <Link
                      href={`/adbuilder/editor?projet=${p.id}`}
                      className="rounded-full bg-[#F1720A] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#C95900]"
                    >
                      Ouvrir
                    </Link>
                    <button
                      onClick={() => handleSupprimer(p.id)}
                      className="text-xs font-medium text-[#D6293E] hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
