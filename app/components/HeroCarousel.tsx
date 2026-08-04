// ============================================================
//  CARROUSEL D'ACCUEIL — Client Component
//  Diapositives, hauteur et vitesse gérées depuis l'admin (/admin/carrousel).
//  Glisse (drag/swipe) + défile automatiquement + flèches.
//  Boucle "sans fin" : après la dernière diapo, on continue dans le
//  même sens (pas de retour en arrière visible) grâce à des clones
//  invisibles au début/à la fin de la piste. Images optimisées (next/image).
// ============================================================

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export type Slide = {
  id: string;
  type: string; // "image", "video" ou "texte"
  imageUrl: string | null; // aussi utilisé pour l'adresse de la vidéo si type = "video"
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
  const realTotal = slides.length;
  const boucle = realTotal > 1; // pas de boucle utile pour 0 ou 1 diapositive

  // Piste étendue : un clone de la dernière diapo au début, un clone de la
  // première à la fin. Ça permet d'avancer "tout droit" au lieu de revenir
  // en arrière quand on boucle. index 1 = 1re vraie diapo, index realTotal
  // = dernière vraie diapo.
  const extended = boucle ? [slides[realTotal - 1], ...slides, slides[0]] : slides;
  const trackCount = extended.length;
  const depart = boucle ? 1 : 0;

  const [index, setIndex] = useState(depart);
  const [pause, setPause] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [snapping, setSnapping] = useState(false); // true = saut sans animation (recalage de boucle)

  const dragStartX = useRef<number | null>(null);
  const aGlisse = useRef(false);

  const suivant = useCallback(() => setIndex((i) => i + 1), []);
  const precedent = useCallback(() => setIndex((i) => i - 1), []);

  useEffect(() => {
    if (pause || dragging || realTotal <= 1) return;
    const t = setInterval(suivant, slideDuration);
    return () => clearInterval(t);
  }, [suivant, pause, dragging, slideDuration, realTotal]);

  // Une fois arrivé sur un clone (début ou fin de piste), on se recale
  // instantanément sur la vraie diapositive correspondante, sans transition
  // visible — c'est ce qui donne l'impression d'une boucle sans fin.
  function onTransitionEnd() {
    if (!boucle) return;
    if (index === trackCount - 1) {
      setSnapping(true);
      setIndex(depart);
    } else if (index === 0) {
      setSnapping(true);
      setIndex(realTotal);
    }
  }

  const snapFrameRef = useRef(0);
  useEffect(() => {
    if (!snapping) return;
    // Double rAF : on laisse le navigateur peindre le saut sans transition
    // avant de réactiver l'animation pour le prochain mouvement.
    snapFrameRef.current = requestAnimationFrame(() => {
      snapFrameRef.current = requestAnimationFrame(() => setSnapping(false));
    });
    return () => cancelAnimationFrame(snapFrameRef.current);
  }, [snapping]);

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

  if (realTotal === 0) return null;

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
          className={`flex h-full ${dragging || snapping ? "" : "transition-transform duration-700 ease-out"}`}
          style={{
            width: `${trackCount * 100}%`,
            transform: `translateX(calc(${-index * (100 / trackCount)}% + ${dragOffset}px))`,
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {extended.map((slide, i) => (
            <Link
              key={`${slide.id}-${i}`}
              href={slide.href}
              draggable={false}
              onClick={(e) => {
                if (aGlisse.current) e.preventDefault();
              }}
              style={{ width: `${100 / trackCount}%` }}
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
                      priority={i === depart} // la 1re vraie diapo se charge en priorité
                      className="object-cover"
                    />
                  )}
                  {/* Léger assombrissement en bas pour la profondeur, façon vitrine */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                </>
              ) : slide.type === "video" ? (
                <>
                  {slide.imageUrl && (
                    <video
                      src={slide.imageUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      // On ne joue que la diapositive visible, pour ne pas gaspiller
                      // la data/batterie des autres en arrière-plan.
                      preload={i === index ? "auto" : "none"}
                      className="absolute inset-0 h-full w-full object-cover"
                      // Compense des vidéos sources un peu sombres/sous-exposées.
                      style={{ filter: "brightness(1.3) contrast(1.05) saturate(1.05)" }}
                    />
                  )}
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

        {realTotal > 1 && (
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
          </>
        )}
      </div>
    </section>
  );
}
