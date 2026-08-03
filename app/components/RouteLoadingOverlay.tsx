// ============================================================
//  ÉCRAN DE CHARGEMENT — Client Component
//  S'affiche dès qu'on clique sur un lien interne, et se cache
//  automatiquement quand la nouvelle page est prête.
// ============================================================

"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function RouteLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const filetSecurite = useRef<ReturnType<typeof setTimeout> | null>(null);

  // La page a changé : la navigation est terminée, on cache l'écran.
  // Fait pendant le rendu (pas dans un effet), en comparant à la route
  // précédente, pour rester conforme à react-hooks/set-state-in-effect.
  const cleRoute = `${pathname}?${searchParams.toString()}`;
  const [cleRoutePrecedente, setCleRoutePrecedente] = useState(cleRoute);
  if (cleRoute !== cleRoutePrecedente) {
    setCleRoutePrecedente(cleRoute);
    setVisible(false);
  }

  // Annule le filet de sécurité de la navigation précédente (pas de setState ici).
  useEffect(() => {
    if (filetSecurite.current) clearTimeout(filetSecurite.current);
  }, [cleRoute]);

  // On surveille les clics sur les liens internes pour afficher l'écran tout de suite.
  useEffect(() => {
    function surClic(e: MouseEvent) {
      // Next.js annule toujours le clic sur ses liens (pour naviguer sans recharger
      // la page) : on ne peut donc pas se baser sur e.defaultPrevented ici.
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const cible = e.target as HTMLElement;
      const lien = cible.closest("a");
      if (!lien) return;

      const href = lien.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (lien.target === "_blank" || lien.hasAttribute("download")) return;
      if (/^https?:\/\//.test(href) && !href.startsWith(window.location.origin)) return;

      const destination = new URL(href, window.location.href);
      const memePage =
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search;
      if (memePage) return;

      setVisible(true);
      // Si la navigation échoue ou traîne, on ne bloque pas le site indéfiniment.
      if (filetSecurite.current) clearTimeout(filetSecurite.current);
      filetSecurite.current = setTimeout(() => setVisible(false), 6000);
    }

    document.addEventListener("click", surClic);
    return () => document.removeEventListener("click", surClic);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Chargement en cours"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#14213D]/15 backdrop-blur-[1px]"
    >
      <div className="limak-loader-rebond">
        <Image
          src="/icon-192.png"
          alt=""
          width={72}
          height={72}
          className="drop-shadow-lg"
          priority
        />
      </div>
      <div className="mt-3 flex gap-1.5">
        <span className="limak-loader-point h-2 w-2 rounded-full bg-[#F1720A]" />
        <span className="limak-loader-point h-2 w-2 rounded-full bg-[#F1720A]" style={{ animationDelay: "0.15s" }} />
        <span className="limak-loader-point h-2 w-2 rounded-full bg-[#F1720A]" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}
