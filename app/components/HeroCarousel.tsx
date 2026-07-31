// ============================================================
//  CARROUSEL D'ACCUEIL — Client Component
//  Mélange images de pub + bannières avec texte.
//  Glisse (drag/swipe) + défile automatiquement (5s, pause au survol)
//  + flèches + points avec barre de progression. Images optimisées (next/image).
// ============================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Slide =
  | { type: "image"; src: string; alt: string; href: string }
  | {
      type: "texte";
      titre: string;
      accroche: string;
      badge?: string;
      href: string;
    };

const SLIDES: Slide[] = [
  {
    type: "image",
    src: "/pubs/pub-accueil.png",
    alt: "Bienvenue chez LIMAK",
    href: "/produits",
  },
  {
    type: "texte",
    badge: "🇨🇮 Livraison rapide · Paiement à la livraison",
    titre: "Tout ce que vous aimez, au meilleur prix",
    accroche: "Montres, sacs, beauté, électroménager, librairie…",
    href: "/produits",
  },
  {
    type: "image",
    src: "/pubs/casio-pub2.png",
    alt: "Montres en promotion",
    href: "/produits?categorie=montres",
  },
  {
    type: "texte",
    badge: "📚 Nouveauté",
    titre: "Enrichissez votre bibliothèque",
    accroche: "Découvrez notre sélection de livres.",
    href: "/produits?categorie=librairie",
  },
  {
    type: "image",
    src: "/pubs/livre-pub.png",
    alt: "Librairie LIMAK",
    href: "/produits?categorie=librairie",
  },
];

const DUREE_SLIDE_MS = 5000;
const SEUIL_SWIPE_PX = 50;
const SEUIL_CLIC_ANNULE_PX = 10;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const total = SLIDES.length;

  const dragStartX = useRef<number | null>(null);
  const aGlisse = useRef(false);

  const suivant = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const precedent = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (pause || dragging) return;
    const t = setInterval(suivant, DUREE_SLIDE_MS);
    return () => clearInterval(t);
  }, [suivant, pause, dragging]);

  function onPointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX;
    aGlisse.current = false;
    setDragging(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > SEUIL_CLIC_ANNULE_PX) aGlisse.current = true;
    setDragOffset(delta);
  }
  function terminerGlissement() {
    if (dragStartX.current === null) return;
    if (dragOffset <= -SEUIL_SWIPE_PX) suivant();
    else if (dragOffset >= SEUIL_SWIPE_PX) precedent();
    dragStartX.current = null;
    setDragOffset(0);
    setDragging(false);
  }

  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-6">
      <div
        className="relative aspect-[16/7] touch-pan-y select-none overflow-hidden rounded-2xl bg-[#14213D] sm:aspect-[16/6]"
        onMouseEnter={() => setPause(true)}
        onMouseLeave={() => setPause(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={terminerGlissement}
        onPointerCancel={terminerGlissement}
        onPointerLeave={() => dragging && terminerGlissement()}
      >
        <div
          className={`flex h-full ${dragging ? "" : "transition-transform duration-700 ease-out"}`}
          style={{
            width: `${total * 100}%`,
            transform: `translateX(calc(${-index * (100 / total)}% + ${dragOffset}px))`,
          }}
        >
          {SLIDES.map((slide, i) => (
            <Link
              key={i}
              href={slide.href}
              draggable={false}
              onClick={(e) => {
                if (aGlisse.current) e.preventDefault();
              }}
              style={{ width: `${100 / total}%` }}
              className="relative block h-full shrink-0"
            >
              {slide.type === "image" ? (
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 1152px"
                  priority={i === 0} // la 1re image se charge en priorité
                  className="object-cover"
                />
              ) : (
                <div className="relative flex h-full flex-col justify-center overflow-hidden px-8 sm:px-14">
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-30 blur-3xl"
                    style={{ background: "#F1720A" }}
                  />
                  {slide.badge && (
                    <span className="relative mb-3 inline-block w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#FFD9A8] sm:text-sm">
                      {slide.badge}
                    </span>
                  )}
                  <h2 className="relative max-w-lg text-2xl font-extrabold text-white sm:text-4xl">
                    {slide.titre}
                  </h2>
                  <p className="relative mt-2 max-w-md text-sm text-neutral-300 sm:text-lg">
                    {slide.accroche}
                  </p>
                  <span className="relative mt-5 inline-block w-fit rounded-full bg-[#F1720A] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#C95900]">
                    Découvrir →
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>

        <button
          onClick={precedent}
          aria-label="Précédent"
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/70 hover:scale-110"
        >
          ‹
        </button>
        <button
          onClick={suivant}
          aria-label="Suivant"
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/70 hover:scale-110"
        >
          ›
        </button>

        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Panneau ${i + 1}`}
              className="relative h-1.5 w-8 overflow-hidden rounded-full bg-white/30"
            >
              <span
                className={`absolute inset-y-0 left-0 rounded-full bg-white ${
                  i < index
                    ? "w-full"
                    : i === index
                      ? "w-0 animate-[limak-progress_5s_linear_forwards]"
                      : "w-0"
                }`}
                style={i === index ? { animationPlayState: pause || dragging ? "paused" : "running" } : undefined}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
