// ============================================================
//  Recherche d'images Unsplash — logique partagée entre la route
//  AdBuilder (auth Clerk) et la route Admin (cookie limak_admin).
//  Nécessite UNSPLASH_API_KEY (plan gratuit suffisant).
// ============================================================

export type ImageUnsplash = {
  id: string;
  urlThumb: string;
  urlFull: string;
  urlTelechargement: string; // pour le ping "download" exigé par Unsplash
  auteurNom: string;
  auteurProfil: string;
};

type ResultatUnsplash = {
  id: string;
  urls: { thumb: string; regular: string };
  links: { download_location: string };
  user: { name: string; links: { html: string } };
};

export async function rechercherImagesUnsplash(
  requete: string,
  orientation: "portrait" | "squarish" | "landscape" = "squarish"
): Promise<{ images: ImageUnsplash[] } | { erreur: string; status: number }> {
  const apiKey = process.env.UNSPLASH_API_KEY;
  if (!apiKey) {
    return { erreur: "Recherche d'images non configurée (UNSPLASH_API_KEY manquante côté serveur).", status: 501 };
  }
  if (!requete.trim()) {
    return { erreur: "Tape un mot-clé avant de chercher.", status: 400 };
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(requete)}&per_page=12&orientation=${orientation}`,
      { headers: { Authorization: `Client-ID ${apiKey}` } }
    );

    if (!res.ok) {
      console.error("[Unsplash] Erreur recherche :", res.status, await res.text());
      return { erreur: "La recherche a échoué (service indisponible).", status: 502 };
    }

    const data = await res.json();
    const images = ((data.results ?? []) as ResultatUnsplash[]).map((r) => ({
      id: r.id,
      urlThumb: r.urls.thumb,
      urlFull: r.urls.regular,
      urlTelechargement: r.links.download_location,
      auteurNom: r.user.name,
      auteurProfil: r.user.links.html,
    }));

    return { images };
  } catch (err) {
    console.error("[Unsplash] Erreur inattendue :", err);
    return { erreur: "La recherche a échoué. Réessaie.", status: 500 };
  }
}

// Unsplash exige un ping vers `download_location` quand une photo est
// effectivement utilisée (pas seulement affichée dans les résultats).
export async function pingTelechargementUnsplash(urlTelechargement: string): Promise<void> {
  const apiKey = process.env.UNSPLASH_API_KEY;
  if (!apiKey) return;
  if (!urlTelechargement.startsWith("https://api.unsplash.com/")) return;
  try {
    await fetch(urlTelechargement, { headers: { Authorization: `Client-ID ${apiKey}` } });
  } catch {
    // Le ping de crédit n'est pas critique — on n'échoue jamais l'action pour ça.
  }
}
