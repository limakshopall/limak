// ============================================================
//  BANNIÈRE D'INSTALLATION — Client Component
//  Propose d'installer LIMAK sur l'écran d'accueil (comme Jumia).
// ============================================================

"use client";

import { useEffect, useState } from "react";

// L'événement "beforeinstallprompt" n'est pas typé par défaut.
type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "limak-install-dismissed";

export default function InstallBanner() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Déjà installé (ouvert en mode appli) → on ne montre rien
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    // Déjà fermé par l'utilisateur → on ne réaffiche pas
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    // iPhone : pas d'installation automatique → on affiche une consigne
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setIsIOS(true);
      setVisible(true);
      return;
    }

    // Android/Chrome : on capte l'événement d'installation
    function onBIP(e: Event) {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", onBIP);
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  function fermer() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  async function installer() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-[#0f1724] px-4 py-2 text-sm text-white">
      <div className="flex min-w-0 items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" className="h-6 w-6 rounded" />
        <span className="truncate">
          {isIOS
            ? "Installez LIMAK : appuyez sur Partager puis « Sur l'écran d'accueil »"
            : "Installez l'application LIMAK sur votre téléphone"}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!isIOS && (
          <button
            onClick={installer}
            className="rounded-full bg-[#e67e22] px-3 py-1 font-semibold text-white hover:bg-[#d35400]"
          >
            Installer
          </button>
        )}
        <button
          onClick={fermer}
          aria-label="Fermer"
          className="text-white/70 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}