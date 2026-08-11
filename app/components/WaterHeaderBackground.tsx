// ============================================================
//  FOND "EAU" INTERACTIF DE L'EN-TÊTE — Client Component
//  Surface d'eau animée en canvas : vaguelettes ambiantes en continu,
//  petite onde au passage de la souris, onde plus forte au clic/tap.
//  Purement décoratif (pointer-events: none, derrière le contenu) :
//  on écoute juste la souris/le toucher sur le conteneur (l'en-tête)
//  pour savoir où dessiner — les vrais liens/boutons restent cliquables.
// ============================================================

"use client";

import { useEffect, useRef } from "react";

type Onde = { x: number; y: number; debut: number; duree: number; force: number };

export default function WaterHeaderBackground({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !container || !ctx) return;

    const reduitMouvement = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let largeur = 0;
    let hauteur = 0;

    function redimensionner() {
      largeur = container!.clientWidth;
      hauteur = container!.clientHeight;
      canvas!.width = largeur * dpr;
      canvas!.height = hauteur * dpr;
      canvas!.style.width = `${largeur}px`;
      canvas!.style.height = `${hauteur}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    redimensionner();
    const resizeObserver = new ResizeObserver(redimensionner);
    resizeObserver.observe(container);

    const ondes: Onde[] = [];
    let dernierMouvement = 0;

    function ajouterOnde(x: number, y: number, force: number, duree: number) {
      ondes.push({ x, y, debut: performance.now(), duree, force });
      if (ondes.length > 40) ondes.shift();
    }

    function positionDans(e: MouseEvent | Touch) {
      const rect = container!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function surMouvement(e: MouseEvent) {
      const maintenant = performance.now();
      if (maintenant - dernierMouvement < 90) return; // throttle : une onde tous les ~90ms max
      dernierMouvement = maintenant;
      const { x, y } = positionDans(e);
      ajouterOnde(x, y, 0.35, 900);
    }

    function surClic(e: MouseEvent) {
      const { x, y } = positionDans(e);
      ajouterOnde(x, y, 1, 1400);
    }

    function surToucher(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const { x, y } = positionDans(t);
      ajouterOnde(x, y, 1, 1400);
    }

    container.addEventListener("mousemove", surMouvement);
    container.addEventListener("mousedown", surClic);
    container.addEventListener("touchstart", surToucher, { passive: true });

    let raf = 0;

    function dessiner(t: number) {
      ctx!.clearRect(0, 0, largeur, hauteur);

      // Fond dégradé "eau nocturne", raccord avec l'indigo nuit du site.
      const degrade = ctx!.createLinearGradient(0, 0, largeur, hauteur);
      degrade.addColorStop(0, "#0c1830");
      degrade.addColorStop(0.55, "#14213D");
      degrade.addColorStop(1, "#123a30");
      ctx!.fillStyle = degrade;
      ctx!.fillRect(0, 0, largeur, hauteur);

      // Vaguelettes ambiantes, toujours en mouvement même sans interaction.
      if (!reduitMouvement) {
        ctx!.globalAlpha = 0.12;
        ctx!.strokeStyle = "#9fc7d9";
        ctx!.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const phase = t / 2600 + i * 2.1;
          ctx!.beginPath();
          for (let x = 0; x <= largeur; x += 8) {
            const y = hauteur * 0.55 + Math.sin(x / 90 + phase) * (hauteur * 0.16) + i * 6;
            if (x === 0) ctx!.moveTo(x, y);
            else ctx!.lineTo(x, y);
          }
          ctx!.stroke();
        }
        ctx!.globalAlpha = 1;
      }

      // Ondes interactives (souris / clic / tap) — liseré doré + éclat blanc.
      for (let i = ondes.length - 1; i >= 0; i--) {
        const o = ondes[i];
        const progres = (t - o.debut) / o.duree;
        if (progres >= 1) {
          ondes.splice(i, 1);
          continue;
        }
        const rayon = progres * 90 * o.force + 6;
        const alpha = (1 - progres) * 0.5 * o.force;

        ctx!.beginPath();
        ctx!.arc(o.x, o.y, rayon, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(232, 194, 85, ${alpha})`;
        ctx!.lineWidth = 2;
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(o.x, o.y, rayon * 0.6, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      raf = requestAnimationFrame(dessiner);
    }
    raf = requestAnimationFrame(dessiner);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", surMouvement);
      container.removeEventListener("mousedown", surClic);
      container.removeEventListener("touchstart", surToucher);
    };
  }, [containerRef]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-0" />;
}
