// Mesure la largeur/hauteur réelle d'une image côté navigateur, après upload,
// pour l'afficher ensuite selon sa vraie forme (carrée, rectangle vertical/horizontal).
export function measureImage(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Impossible de lire les dimensions de l'image."));
    img.src = url;
  });
}
