// ============================================================
//  ADBUILDER — recherche d'images via Unsplash
//  Nécessite UNSPLASH_API_KEY (plan gratuit suffisant). Sans clé :
//  erreur claire renvoyée au client, rien ne casse ailleurs.
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ erreur: "Connecte-toi pour utiliser cette fonctionnalité." }, { status: 401 });
  }

  const apiKey = process.env.UNSPLASH_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erreur: "Recherche d'images non configurée (UNSPLASH_API_KEY manquante côté serveur)." },
      { status: 501 }
    );
  }

  const { searchParams } = new URL(request.url);
  const requete = searchParams.get("q")?.trim();
  if (!requete) {
    return NextResponse.json({ erreur: "Tape un mot-clé avant de chercher." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(requete)}&per_page=12&orientation=portrait`,
      { headers: { Authorization: `Client-ID ${apiKey}` } }
    );

    if (!res.ok) {
      console.error("[AdBuilder Images] Erreur Unsplash :", res.status, await res.text());
      return NextResponse.json({ erreur: "La recherche a échoué (service indisponible)." }, { status: 502 });
    }

    const data = await res.json();
    type ResultatUnsplash = {
      id: string;
      urls: { thumb: string; regular: string };
      links: { download_location: string };
      user: { name: string; links: { html: string } };
    };
    const images = ((data.results ?? []) as ResultatUnsplash[]).map((r) => ({
      id: r.id,
      urlThumb: r.urls.thumb,
      urlFull: r.urls.regular,
      urlTelechargement: r.links.download_location,
      auteurNom: r.user.name,
      auteurProfil: r.user.links.html,
    }));

    return NextResponse.json({ images });
  } catch (err) {
    console.error("[AdBuilder Images] Erreur inattendue :", err);
    return NextResponse.json({ erreur: "La recherche a échoué. Réessaie." }, { status: 500 });
  }
}

// Unsplash exige un ping vers `download_location` quand une photo est
// effectivement utilisée (pas seulement affichée dans les résultats).
export async function POST(request: Request) {
  const apiKey = process.env.UNSPLASH_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false }, { status: 501 });

  const { urlTelechargement } = (await request.json()) as { urlTelechargement?: string };
  if (!urlTelechargement || !urlTelechargement.startsWith("https://api.unsplash.com/")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await fetch(urlTelechargement, { headers: { Authorization: `Client-ID ${apiKey}` } });
  } catch {
    // Le ping de crédit n'est pas critique — on n'échoue jamais l'action de l'utilisateur pour ça.
  }
  return NextResponse.json({ ok: true });
}
