// ============================================================
//  RÉVÉLATION AU DÉFILEMENT — Client Component
//  Fait apparaître son contenu (fondu + léger décalage vers le haut)
//  quand il entre dans l'écran. Casse l'effet "page statique".
// ============================================================

"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      if (visibleRef.current) return;
      visibleRef.current = true;
      setVisible(true);
      observer.disconnect();
      window.removeEventListener("scroll", filetDeSecurite);
      window.removeEventListener("resize", filetDeSecurite);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal();
      },
      { threshold: 0.15, rootMargin: "200px 0px" }
    );
    observer.observe(el);

    // Filet de sécurité : un défilement instantané (touche Fin, clic sur la
    // barre de défilement, capture d'écran automatisée...) peut faire "sauter"
    // par-dessus une section sans jamais la faire passer devant l'écran ->
    // l'IntersectionObserver ne se déclenche alors jamais et la section reste
    // invisible pour toujours (un grand carré vide). On vérifie donc aussi sa
    // position réelle à chaque arrêt de défilement.
    const filetDeSecurite = () => {
      if (visibleRef.current) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) reveal();
    };
    window.addEventListener("scroll", filetDeSecurite, { passive: true });
    window.addEventListener("resize", filetDeSecurite);
    filetDeSecurite(); // au cas où déjà visible/dépassée au montage

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", filetDeSecurite);
      window.removeEventListener("resize", filetDeSecurite);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
