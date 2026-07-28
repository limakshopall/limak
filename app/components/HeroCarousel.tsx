// ============================================================
//  CARROUSEL D'ACCUEIL — Client Component
//  Mélange images de pub + bannières avec texte.
//  Défile automatiquement (5s) + flèches + points.
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// Les panneaux du carrousel.
// type "image" = une de tes pubs ; type "texte" = une bannière avec accroche.
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

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const total = SLIDES.length;

  const suivant = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const precedent = useCallback(
    () => setIndex((i) => (i - 1 + total) % total),
    [total]
  );

  // Défilement automatique toutes les 5 secondes
  useEffect(() => {
    const t = setInterval(suivant, 5000);
    return () => clearInterval(t);
  }, [suivant]);

  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-6">
      <div className="relative aspect-[16/7] overflow-hidden rounded-2xl bg-[#0f1724] sm:aspect-[16/6]">
        {/* Les panneaux, empilés ; seul l'actif est visible */}
        {SLIDES.map((slide, i) => (
          <Link
            key={i}
            href={slide.href}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {slide.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="relative flex h-full flex-col justify-center overflow-hidden px-8 sm:px-14">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-30 blur-3xl"
                  style={{ background: "#e67e22" }}
                />
                {slide.badge && (
                  <span className="relative mb-3 inline-block w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-white sm:text-sm">
                    {slide.badge}
                  </span>
                )}
                <h2 className="relative max-w-lg text-2xl font-extrabold text-white sm:text-4xl">
                  {slide.titre}
                </h2>
                <p className="relative mt-2 max-w-md text-sm text-neutral-300 sm:text-lg">
                  {slide.accroche}
                </p>
                <span className="relative mt-5 inline-block w-fit rounded-full bg-[#e67e22] px-6 py-2 text-sm font-semibold text-white">
                  Découvrir →
                </span>
              </div>
            )}
          </Link>
        ))}

        {/* Flèche gauche */}
        <button
          onClick={precedent}
          aria-label="Précédent"
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/70"
        >
          ‹
        </button>
        {/* Flèche droite */}
        <button
          onClick={suivant}
          aria-label="Suivant"
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/70"
        >
          ›
        </button>

        {/* Points */}
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Panneau ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
