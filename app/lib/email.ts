// ============================================================
//  ENVOI D'EMAIL — via Resend.
//  Comme pour les SMS (app/lib/sms.ts) : un échec d'envoi ne doit
//  JAMAIS bloquer une action de l'utilisateur.
//
//  ⚠️ Tant qu'aucun domaine n'est vérifié sur resend.com, Resend
//  refuse d'envoyer vers d'autres adresses que celle du compte —
//  utile pour tester, pas encore pour de vrais clients.
// ============================================================

import { Resend } from "resend";

// URL de base du site, pour les liens dans les emails.
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://limak-two.vercel.app";

// Adresse d'expédition. "onboarding@resend.dev" marche sans domaine vérifié
// (mais seulement vers l'email du compte Resend) — à remplacer par une
// adresse @limak.ci une fois le domaine vérifié sur Resend.
const FROM = process.env.RESEND_FROM ?? "LIMAK <onboarding@resend.dev>";

type RappelAvisInput = {
  email: string;
  orderId: string | number;
  customerName?: string;
};

export async function sendReviewReminderEmail(input: RappelAvisInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email:rappel-avis] RESEND_API_KEY manquant — non envoyé.");
    return;
  }
  if (!input.email) {
    console.warn("[Email:rappel-avis] Adresse email absente — non envoyé.");
    return;
  }

  const resend = new Resend(apiKey);
  const bonjour = input.customerName ? `Bonjour ${input.customerName},` : "Bonjour,";
  const lienCommandes = `${BASE_URL}/mes-commandes`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: input.email,
      subject: "Votre avis compte pour LIMAK 🙏",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #14213D;">
          <h1 style="color: #14213D; font-size: 20px;">${bonjour}</h1>
          <p>Votre commande LIMAK n°${input.orderId} a bien été livrée. Nous espérons qu'elle vous plaît !</p>
          <p>Auriez-vous 30 secondes pour laisser un avis sur le ou les articles reçus ? Ça aide énormément les autres clients à choisir en confiance.</p>
          <p style="text-align: center; margin: 28px 0;">
            <a href="${lienCommandes}" style="background:#F1720A; color:#fff; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:600;">
              Laisser un avis
            </a>
          </p>
          <p style="font-size: 13px; color: #6b7280;">Merci pour votre confiance — l'équipe LIMAK.</p>
        </div>
      `,
    });
    if (error) {
      console.error("[Email:rappel-avis] Erreur Resend:", error);
      return;
    }
    console.log(`[Email:rappel-avis] Envoyé à ${input.email} pour la commande ${input.orderId}.`);
  } catch (err) {
    console.error("[Email:rappel-avis] Échec réseau:", err);
  }
}
