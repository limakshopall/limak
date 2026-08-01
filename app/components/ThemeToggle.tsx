// ============================================================
//  INTERRUPTEUR MODE SOMBRE — bascule la classe .dark sur <html>
//  et mémorise le choix dans localStorage ("theme": "dark"|"light").
//  Le script inline dans layout.tsx applique déjà ce choix avant
//  l'affichage, donc ici on ne fait que lire l'état déjà posé.
// ============================================================

"use client";

import { useEffect, useState } from "react";

function IconeSoleil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IconeLune({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle({
  className,
  // "icon" : juste l'icône (usage header). "item" : icône + libellé sur toute la largeur (usage menu latéral).
  variant = "icon",
}: {
  className?: string;
  variant?: "icon" | "item";
}) {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function basculer() {
    const prochain = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", prochain);
    localStorage.setItem("theme", prochain ? "dark" : "light");
    setDark(prochain);
  }

  // Tant qu'on ne connaît pas l'état réel (posé par le script inline avant
  // hydratation), on affiche un espace vide pour éviter un mismatch React.
  if (dark === null) {
    if (variant === "item") {
      return <div className={className} style={{ height: 42 }} />;
    }
    return <span className={className} style={{ display: "inline-block", width: 20, height: 20 }} />;
  }

  if (variant === "item") {
    return (
      <button
        type="button"
        onClick={basculer}
        className={className}
      >
        {dark ? <IconeSoleil className="h-4.5 w-4.5 shrink-0" /> : <IconeLune className="h-4.5 w-4.5 shrink-0" />}
        {dark ? "Mode clair" : "Mode sombre"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={basculer}
      aria-label={dark ? "Passer au thème clair" : "Passer au thème sombre"}
      className={className}
    >
      {dark ? <IconeSoleil className="h-5 w-5" /> : <IconeLune className="h-5 w-5" />}
    </button>
  );
}
