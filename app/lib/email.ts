// ============================================================
//  ENVOI D'EMAIL — via Resend.
//  Comme pour les SMS (app/lib/sms.ts) : un échec d'envoi ne doit
//  JAMAIS bloquer une action de l'utilisateur.
//
//  Domaine limak.ci vérifié sur Resend (14/08/2026) — les emails
//  partent vers de vrais clients, plus seulement vers le compte Resend.
//
//  Le client est notifié par EMAIL, pas SMS (Africa's Talking mis de
//  côté : les SMS étaient acceptés/facturés mais jamais livrés, faute
//  de Sender ID enregistré — voir mémoire projet). L'email client est
//  facultatif au checkout ; si absent, l'admin est prévenu par l'alerte
//  de nouvelle commande pour appeler le client directement.
// ============================================================

import { Resend } from "resend";

// URL de base du site, pour les liens dans les emails.
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://limak-two.vercel.app";

// Adresse d'expédition — @limak.ci (domaine vérifié sur Resend).
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

type AlerteAdminInput = {
  orderId: string | number;
  customerName: string;
  customerPhone: string;
  shippingCity: string;
  shippingAddress: string;
  total: number;
  itemCount: number;
  clientSansEmail: boolean; // true = le client n'a pas de moyen d'être notifié par email, à appeler
};

// Alerte envoyée à TOI (l'admin) à chaque nouvelle commande — remplace
// l'ancienne alerte par SMS (coût réduit, un SMS reste réservé au client).
export async function sendAdminOrderAlertEmail(input: AlerteAdminInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey) {
    console.warn("[Email:admin] RESEND_API_KEY manquant — alerte non envoyée.");
    return;
  }
  if (!adminEmail) {
    console.warn("[Email:admin] ADMIN_EMAIL manquant dans .env — alerte non envoyée.");
    return;
  }

  const { orderId, customerName, customerPhone, shippingCity, shippingAddress, total, itemCount, clientSansEmail } =
    input;
  const resend = new Resend(apiKey);
  const lienCommande = `${BASE_URL}/admin/commandes`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: adminEmail,
      subject: `🛎️ Nouvelle commande LIMAK n°${orderId} — ${Number(total).toLocaleString("fr-FR")} FCFA`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #14213D;">
          <h1 style="color: #14213D; font-size: 20px;">Nouvelle commande !</h1>
          ${
            clientSansEmail
              ? `<p style="background:#FBEEDA; border-left:4px solid #D6293E; padding:10px 14px; font-weight:600; color:#D6293E;">
                  ⚠️ Ce client n'a pas fourni d'email — appelle-le directement au ${customerPhone} pour confirmer sa commande.
                 </p>`
              : ""
          }
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #6b7280;">Commande</td><td style="padding: 6px 0; font-weight: 600;">n°${orderId}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Client</td><td style="padding: 6px 0;">${customerName}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Téléphone</td><td style="padding: 6px 0;">${customerPhone}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Livraison</td><td style="padding: 6px 0;">${shippingAddress}, ${shippingCity}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Articles</td><td style="padding: 6px 0;">${itemCount}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Total</td><td style="padding: 6px 0; font-weight: 700;">${Number(total).toLocaleString("fr-FR")} FCFA</td></tr>
          </table>
          <p style="text-align: center; margin: 28px 0;">
            <a href="${lienCommande}" style="background:#F1720A; color:#fff; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:600;">
              Voir dans l'admin
            </a>
          </p>
        </div>
      `,
    });
    if (error) {
      console.error("[Email:admin] Erreur Resend:", error);
      return;
    }
    console.log(`[Email:admin] Envoyé à ${adminEmail} pour la commande ${orderId}.`);
  } catch (err) {
    console.error("[Email:admin] Échec réseau:", err);
  }
}

type ConfirmationCommandeInput = {
  email: string;
  orderId: string | number;
  customerName?: string;
  total: number;
};

// 1) Email de confirmation envoyé au CLIENT (remplace l'ancien SMS —
// voir en-tête de fichier).
export async function sendOrderConfirmationEmail(input: ConfirmationCommandeInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email:confirmation] RESEND_API_KEY manquant — non envoyé.");
    return;
  }
  if (!input.email) {
    console.warn("[Email:confirmation] Adresse email absente — non envoyé.");
    return;
  }

  const resend = new Resend(apiKey);
  const bonjour = input.customerName ? `Bonjour ${input.customerName},` : "Bonjour,";

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: input.email,
      subject: `✅ Commande LIMAK n°${input.orderId} bien reçue`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #14213D;">
          <h1 style="color: #14213D; font-size: 20px;">${bonjour}</h1>
          <p>Votre commande LIMAK <strong>n°${input.orderId}</strong> est bien reçue, pour un total de
             <strong>${Number(input.total).toLocaleString("fr-FR")} FCFA</strong>.</p>
          <p>Paiement à la livraison, comme d'habitude. Merci pour votre confiance !</p>
          <p style="font-size: 13px; color: #6b7280;">L'équipe LIMAK.</p>
        </div>
      `,
    });
    if (error) {
      console.error("[Email:confirmation] Erreur Resend:", error);
      return;
    }
    console.log(`[Email:confirmation] Envoyé à ${input.email} pour la commande ${input.orderId}.`);
  } catch (err) {
    console.error("[Email:confirmation] Échec réseau:", err);
  }
}

type NotificationCadeauInput = {
  email: string;
  orderId: string | number;
  giftFromName: string;
};

// 2) Email envoyé au DESTINATAIRE d'un cadeau (jamais le prix, c'est une surprise).
export async function sendGiftNotificationEmail(input: NotificationCadeauInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email:cadeau] RESEND_API_KEY manquant — non envoyé.");
    return;
  }
  if (!input.email) {
    console.warn("[Email:cadeau] Adresse email absente — non envoyé.");
    return;
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: input.email,
      subject: `🎁 ${input.giftFromName} vous offre un colis LIMAK !`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #14213D;">
          <h1 style="color: #14213D; font-size: 20px;">🎁 Vous avez reçu un cadeau !</h1>
          <p><strong>${input.giftFromName}</strong> vous offre un colis LIMAK — commande <strong>n°${input.orderId}</strong> en préparation, livraison bientôt chez vous.</p>
          <p>Paiement à la livraison comme d'habitude — voyez avec ${input.giftFromName} pour ça.</p>
          <p style="font-size: 13px; color: #6b7280;">L'équipe LIMAK.</p>
        </div>
      `,
    });
    if (error) {
      console.error("[Email:cadeau] Erreur Resend:", error);
      return;
    }
    console.log(`[Email:cadeau] Envoyé à ${input.email} pour la commande ${input.orderId}.`);
  } catch (err) {
    console.error("[Email:cadeau] Échec réseau:", err);
  }
}

type SuiviStatutInput = {
  email: string;
  orderId: string | number;
  status: "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
};

// 3) Email de suivi envoyé au CLIENT quand le statut de sa commande change.
export async function sendOrderStatusEmail(input: SuiviStatutInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email:statut] RESEND_API_KEY manquant — non envoyé.");
    return;
  }
  if (!input.email) {
    console.warn("[Email:statut] Adresse email absente — non envoyé.");
    return;
  }

  const { orderId, status } = input;
  const contenu: Record<SuiviStatutInput["status"], { sujet: string; texte: string }> = {
    CONFIRMED: {
      sujet: `Commande LIMAK n°${orderId} confirmée`,
      texte: "Bonne nouvelle ! Votre commande est confirmée. Nous la préparons.",
    },
    SHIPPED: {
      sujet: `Commande LIMAK n°${orderId} en route`,
      texte: "Votre commande est en route ! Vous serez livré très bientôt. Paiement à la livraison.",
    },
    DELIVERED: {
      sujet: `Commande LIMAK n°${orderId} livrée`,
      texte: "Votre commande a été livrée. Merci pour votre confiance et à bientôt !",
    },
    CANCELLED: {
      sujet: `Commande LIMAK n°${orderId} annulée`,
      texte: "Votre commande a été annulée. Pour toute question, contactez-nous.",
    },
  };
  const { sujet, texte } = contenu[status];

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: input.email,
      subject: sujet,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #14213D;">
          <h1 style="color: #14213D; font-size: 20px;">${sujet}</h1>
          <p>${texte}</p>
          <p style="font-size: 13px; color: #6b7280;">L'équipe LIMAK.</p>
        </div>
      `,
    });
    if (error) {
      console.error(`[Email:statut-${status}] Erreur Resend:`, error);
      return;
    }
    console.log(`[Email:statut-${status}] Envoyé à ${input.email} pour la commande ${orderId}.`);
  } catch (err) {
    console.error(`[Email:statut-${status}] Échec réseau:`, err);
  }
}
