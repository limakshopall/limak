// ============================================================
//  ADBUILDER — utilitaires canvas (export PNG, chargement image)
// ============================================================

import type Konva from "konva";

// Export toujours à la pleine résolution du format choisi, quelle que soit
// la taille d'affichage à l'écran (aperçu réduit) — grâce à `pixelRatio`.
export function exporterStagePNG(stage: Konva.Stage, nomFichier: string, largeurCible: number) {
  const ratioActuel = stage.width() > 0 ? largeurCible / stage.width() : 1;
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
