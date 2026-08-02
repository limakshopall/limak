// ============================================================
//  CARROUSEL D'ACCUEIL — Client Component
//  Diapositives, hauteur et vitesse gérées depuis l'admin (/admin/carrousel).
//  Glisse (drag/swipe) + défile automatiquement + flèches + points avec
//  barre de progression. Images optimisées (next/image).
// ============================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export type Slide = {
  id: string;
  type: string; // "image" ou "texte"
  imageUrl: string | null;
  alt: string | null;
  title: string | null;
  subtitle: string | null;
  badge: string | null;
  href: string;
};

const SEUIL_SWIPE_PX = 50;
const SEUIL_CLIC_ANNULE_PX = 10;

export default function HeroCarousel({
  slides,
  heightVh = 45,
  slideDuration = 5000,
}: {
  slides: Slide[];
  heightVh?: number;
  slideDuration?: number;
}) {
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const total = slides.length;

  const dragStartX = useRef<number | null>(null);
  const aGlisse = useRef(false);

  const suivant = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const precedent = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (pause || dragging || total <= 1) return;
    const t = setInterval(suivant, slideDuration);
    return () => clearInterval(t);
  }, [suivant, pause, dragging, slideDuration, total]);

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

  if (total === 0) return null;

  return (
    <section className="relative">
      <div
        className="relative touch-pan-y select-none overflow-hidden border-y-4 border-[#E8C255] bg-[#14213D]"
        style={{ height: `${heightVh}svh`, maxHeight: 720, minHeight: 260 }}
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
          {slides.map((slide, i) => (
            <Link
              key={slide.id}
              href={slide.href}
              draggable={false}
              onClick={(e) => {
                if (aGlisse.current) e.preventDefault();
              }}
              style={{ width: `${100 / total}%` }}
              className="relative block h-full shrink-0"
            >
              {slide.type === "image" ? (
                <>
                  {slide.imageUrl && (
                    <Image
                      src={slide.imageUrl}
                      alt={slide.alt ?? ""}
                      fill
                      sizes="(max-width: 768px) 100vw, 1152px"
                      priority={i === 0} // la 1re image se charge en priorité
                      className="object-cover"
                    />
                  )}
                  {/* Léger assombrissement en bas pour la profondeur, façon vitrine */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                </>
              ) : (
                <div className="relative flex h-full flex-col justify-center overflow-hidden px-8 sm:px-14">
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-30 blur-3xl"
                    style={{ background: "#F1720A" }}
                  />
                  <div
                    className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full opacity-20 blur-3xl"
                    style={{ background: "#E8C255" }}
                  />
                  {slide.badge && (
                    <span
                      className={`relative mb-3 inline-block w-fit rounded-full border border-[#E8C255]/40 bg-[#E8C255]/10 px-3 py-1 text-xs font-semibold text-[#E8C97A] sm:text-sm ${
                        i === index ? "animate-[limak-fade-up_0.6s_ease-out]" : ""
                      }`}
                    >
                      {slide.badge}
                    </span>
                  )}
                  <h2
                    className={`relative max-w-lg text-3xl font-extrabold text-white sm:text-5xl ${
                      i === index ? "animate-[limak-fade-up_0.6s_ease-out_0.1s_both]" : ""
                    }`}
                  >
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p
                      className={`relative mt-3 max-w-md text-base text-neutral-300 sm:text-lg ${
                        i === index ? "animate-[limak-fade-up_0.6s_ease-out_0.2s_both]" : ""
                      }`}
                    >
                      {slide.subtitle}
                    </p>
                  )}
                  <span
                    className={`limak-cta-pulse relative mt-6 inline-block w-fit rounded-full bg-[#F1720A] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#C95900] sm:text-base ${
                      i === index ? "animate-[limak-fade-up_0.6s_ease-out_0.3s_both]" : ""
                    }`}
                  >
                    Découvrir →
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>

        {total > 1 && (
          <>
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
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Panneau ${i + 1}`}
                  className="relative h-1.5 w-8 overflow-hidden rounded-full bg-white/30"
                >
                  <span
                    className={`absolute inset-y-0 left-0 rounded-full bg-white ${
                      i < index ? "w-full" : i === index ? "limak-progress-bar w-0" : "w-0"
                    }`}
                    style={
                      i === index
                        ? {
                            animationDuration: `${slideDuration}ms`,
                            animationPlayState: pause || dragging ? "paused" : "running",
                          }
                        : undefined
                    }
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
