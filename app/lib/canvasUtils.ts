// ============================================================
//  ADBUILDER — utilitaires canvas (export PNG, dimensions)
// ============================================================

import type Konva from "konva";

// Format standard "story" (Instagram/TikTok/Facebook) : 1080x1920.
export const LARGEUR_EXPORT = 1080;
export const HAUTEUR_EXPORT = 1920;

// Le canvas s'affiche à l'écran en plus petit (aperçu), mais l'export se
// fait toujours à la pleine résolution grâce à `pixelRatio`.
export function exporterStagePNG(stage: Konva.Stage, nomFichier: string) {
  const ratioActuel = stage.width() > 0 ? LARGEUR_EXPORT / stage.width() : 1;
  const dataUrl = stage.toDataURL({ mimeType: "image/png", pixelRatio: ratioActuel });

  const lien = document.createElement("a");
  lien.href = dataUrl;
  lien.download = nomFichier.endsWith(".png") ? nomFichier : `${nomFichier}.png`;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
}

// Charge un fichier image (input file) en élément <img> prêt pour Konva.
export function chargerImageDepuisFichier(fichier: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = lecteur.result as string;
    };
    lecteur.onerror = reject;
    lecteur.readAsDataURL(fichier);
  });
}

// Recharge une image déjà en data URL (projet enregistré) en élément <img>.
export function chargerImageDepuisDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
