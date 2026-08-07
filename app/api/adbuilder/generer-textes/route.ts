// ============================================================
//  ADBUILDER — génération de textes publicitaires via OpenAI
//  Nécessite OPENAI_API_KEY (payant à l'usage). Sans clé : erreur
//  claire renvoyée au client, rien ne casse ailleurs sur le site.
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ erreur: "Connecte-toi pour utiliser cette fonctionnalité." }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erreur: "Génération IA non configurée (OPENAI_API_KEY manquante côté serveur)." },
      { status: 501 }
    );
  }

  const { description } = (await request.json()) as { description?: string };
  if (!description || !description.trim()) {
    return NextResponse.json({ erreur: "Décris ton produit avant de générer." }, { status: 400 });
  }

  const prompt = `Tu écris des textes publicitaires en français pour LIMAK, une boutique en ligne
en Côte d'Ivoire (paiement à la livraison, devise FCFA). Le vendeur décrit son produit ainsi :
"${description.trim()}"

Génère exactement :
- 5 titres d'accroche courts (max 6 mots), percutants, sans emoji excessif
- 5 descriptions courtes (max 12 mots)
- 5 call-to-action (CTA) de bouton (max 4 mots)

Ne revendique jamais l'authenticité d'une marque déposée ni de certificat non vérifiable.
Réponds UNIQUEMENT en JSON strict au format :
{"titres": ["...", ...], "descriptions": ["...", ...], "ctas": ["...", ...]}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.9,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[AdBuilder IA] Erreur OpenAI :", res.status, detail);
      return NextResponse.json({ erreur: "La génération a échoué (service IA indisponible)." }, { status: 502 });
    }

    const data = await res.json();
    const contenu = data.choices?.[0]?.message?.content;
    const resultat = JSON.parse(contenu) as { titres: string[]; descriptions: string[]; ctas: string[] };

    return NextResponse.json({
      titres: (resultat.titres ?? []).slice(0, 5),
      descriptions: (resultat.descriptions ?? []).slice(0, 5),
      ctas: (resultat.ctas ?? []).slice(0, 5),
    });
  } catch (err) {
    console.error("[AdBuilder IA] Erreur inattendue :", err);
    return NextResponse.json({ erreur: "La génération a échoué. Réessaie." }, { status: 500 });
  }
}
