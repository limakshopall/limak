// ============================================================
//  META PIXEL — helper d'envoi d'événements côté client
//  (fbq est chargé par components/MetaPixel.tsx, voir app/layout.tsx)
// ============================================================

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackerMetaPixel(evenement: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", evenement, params);
}
