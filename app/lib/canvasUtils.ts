// ============================================================
//  ADBUILDER — utilitaires canvas (export PNG, chargement image)
// ============================================================

import type Konva from "konva";

// Masque temporairement les aides visuelles (grille, poignées de sélection)
// qui ne doivent jamais apparaître dans un export — retourne une fonction
// qui les remet dans leur état d'origine.
function masquerAidesVisuelles(stage: Konva.Stage): () => void {
  const grille = stage.find(".grille-apercu");
  const transformer = stage.findOne("Transformer");
  const etaientVisibles = grille.map((n) => n.visible());
  const transformerVisible = transformer?.visible() ?? false;
  grille.forEach((n) => n.hide());
  transformer?.hide();
  stage.batchDraw();
  return () => {
    grille.forEach((n, i) => n.visible(etaientVisibles[i]));
    if (transformer && transformerVisible) transformer.show();
    stage.batchDraw();
  };
}

// Export toujours à la pleine résolution du format choisi, quelle que soit
// la taille d'affichage à l'écran (aperçu réduit) — grâce à `pixelRatio`.
export function exporterStagePNG(stage: Konva.Stage, nomFichier: string, largeurCible: number) {
  const restaurer = masquerAidesVisuelles(stage);
  const ratioActuel = stage.width() > 0 ? largeurCible / stage.width() : 1;
  const dataUrl = stage.toDataURL({ mimeType: "image/png", pixelRatio: ratioActuel });
  restaurer();

  const lien = document.createElement("a");
  lien.href = dataUrl;
  lien.download = nomFichier.endsWith(".png") ? nomFichier : `${nomFichier}.png`;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
}

// Pour les usages qui ont besoin du data URL directement (ex : mockups),
// sans déclencher un téléchargement.
export function stageEnDataUrl(stage: Konva.Stage, pixelRatio = 1): string {
  const restaurer = masquerAidesVisuelles(stage);
  const dataUrl = stage.toDataURL({ mimeType: "image/png", pixelRatio });
  restaurer();
  return dataUrl;
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
