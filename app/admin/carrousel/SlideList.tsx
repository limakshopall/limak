// ============================================================
//  LISTE DES DIAPOSITIVES (admin) — Client Component
//  Réordonner (▲▼), activer/désactiver, modifier, supprimer.
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deleteSlide, moveSlide, toggleSlideActive } from "./actions";
import SlideForm from "./SlideForm";

type Slide = {
  id: string;
  type: string;
  imageUrl: string | null;
  alt: string | null;
  title: string | null;
  subtitle: string | null;
  badge: string | null;
  href: string;
  isActive: boolean;
};

export default function SlideList({ slides }: { slides: Slide[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [enEdition, setEnEdition] = useState<string | null>(null);

  function supprimer(id: string) {
    const ok = window.confirm("Supprimer cette diapositive ?");
    if (!ok) return;
    startTransition(async () => {
      await deleteSlide(id);
      router.refresh();
    });
  }

  function deplacer(id: string, direction: "up" | "down") {
    startTransition(async () => {
      await moveSlide(id, direction);
      router.refresh();
    });
  }

  function basculerActive(id: string, isActive: boolean) {
    startTransition(async () => {
      await toggleSlideActive(id, !isActive);
      router.refresh();
    });
  }

  if (slides.length === 0) {
    return <p className="text-sm text-neutral-400 dark:text-gray-400">Aucune diapositive pour l&apos;instant.</p>;
  }

  return (
    <div className="space-y-3">
      {slides.map((s, i) => {
        if (enEdition === s.id) {
          return <SlideForm key={s.id} slide={s} onDone={() => setEnEdition(null)} />;
        }
        return (
          <div
            key={s.id}
            className={`flex items-center gap-3 rounded-lg border border-[#14213D]/10 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333] ${
              !s.isActive ? "opacity-50" : ""
            }`}
          >
            <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded bg-white dark:bg-[#05070d]">
              {s.type === "image" && s.imageUrl ? (
                <Image src={s.imageUrl} alt="" fill className="object-cover" sizes="96px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#14213D] px-1 text-center text-[9px] font-semibold text-[#E8C255]">
                  {s.title || "Texte"}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#14213D] dark:text-gray-300">
                {s.type === "image" ? s.alt || "Diapositive image" : s.title}
              </p>
              <p className="truncate text-xs text-neutral-400 dark:text-gray-400">{s.href}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                disabled={pending || i === 0}
                onClick={() => deplacer(s.id, "up")}
                aria-label="Monter"
                className="rounded px-1.5 py-1 text-[#14213D] hover:bg-[#14213D]/10 disabled:opacity-20 dark:text-gray-300"
              >
                ▲
              </button>
              <button
                type="button"
                disabled={pending || i === slides.length - 1}
                onClick={() => deplacer(s.id, "down")}
                aria-label="Descendre"
                className="rounded px-1.5 py-1 text-[#14213D] hover:bg-[#14213D]/10 disabled:opacity-20 dark:text-gray-300"
              >
                ▼
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => basculerActive(s.id, s.isActive)}
                className="rounded-full border border-[#14213D]/20 px-2 py-1 text-xs font-medium text-[#14213D] hover:bg-[#14213D]/5 dark:border-white/15 dark:text-gray-300"
              >
                {s.isActive ? "Masquer" : "Afficher"}
              </button>
              <button
                type="button"
                onClick={() => setEnEdition(s.id)}
                className="rounded-full border border-[#14213D]/20 px-2 py-1 text-xs font-medium text-[#14213D] hover:bg-[#14213D]/5 dark:border-white/15 dark:text-gray-300"
              >
                Modifier
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => supprimer(s.id)}
                className="rounded-full px-2 py-1 text-xs font-medium text-[#D6293E] hover:underline"
              >
                Supprimer
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
