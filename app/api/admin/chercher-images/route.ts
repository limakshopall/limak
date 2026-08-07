// ============================================================
//  ADMIN — recherche d'images via Unsplash (pour catégories, etc.)
//  Réservée à l'admin connecté (cookie limak_admin), même logique
//  que app/api/uploadthing/core.ts.
// ============================================================

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { rechercherImagesUnsplash, pingTelechargementUnsplash } from "../../../lib/unsplash";

async function estAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("limak_admin")?.value;
  return !!token && token === process.env.ADMIN_SESSION_TOKEN;
}

export async function GET(request: Request) {
  if (!(await estAdmin())) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requete = searchParams.get("q") ?? "";
  const resultat = await rechercherImagesUnsplash(requete, "squarish");
  if ("erreur" in resultat) return NextResponse.json({ erreur: resultat.erreur }, { status: resultat.status });
  return NextResponse.json(resultat);
}

export async function POST(request: Request) {
  if (!(await estAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { urlTelechargement } = (await request.json()) as { urlTelechargement?: string };
  if (!urlTelechargement) return NextResponse.json({ ok: false }, { status: 400 });
  await pingTelechargementUnsplash(urlTelechargement);
  return NextResponse.json({ ok: true });
}
