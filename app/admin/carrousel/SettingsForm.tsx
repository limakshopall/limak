// ============================================================
//  RÉGLAGES DU CARROUSEL (admin) — Client Component
//  Hauteur (% de l'écran) et vitesse de défilement automatique.
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateHeroSettings } from "./actions";

export default function SettingsForm({
  heightVh,
  slideDuration,
}: {
  heightVh: number;
  slideDuration: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [hauteur, setHauteur] = useState(heightVh);
  const [duree, setDuree] = useState(slideDuration);
  const [enregistre, setEnregistre] = useState(false);

  function enregistrer() {
    startTransition(async () => {
      await updateHeroSettings(hauteur, duree);
      setEnregistre(true);
      setTimeout(() => setEnregistre(false), 1500);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-[#14213D]/10 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-neutral-600 dark:text-gray-400">
            Hauteur du carrousel ({hauteur}% de l&apos;écran)
          </label>
          <input
            type="range"
            min={20}
            max={100}
            value={hauteur}
            onChange={(e) => setHauteur(Number(e.target.value))}
            className="mt-2 w-full accent-[#F1720A]"
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-600 dark:text-gray-400">
            Vitesse de défilement ({(duree / 1000).toFixed(1)}s par diapositive)
          </label>
          <input
            type="range"
            min={2000}
            max={15000}
            step={500}
            value={duree}
            onChange={(e) => setDuree(Number(e.target.value))}
            className="mt-2 w-full accent-[#F1720A]"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={enregistrer}
        className="mt-4 rounded-full bg-[#14213D] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#14213D]/85 disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : enregistre ? "Enregistré ✓" : "Enregistrer les réglages"}
      </button>
    </div>
  );
}
