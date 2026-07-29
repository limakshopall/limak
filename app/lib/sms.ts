// app/lib/sms.ts
// Envoi de SMS via l'API Africa's Talking (Sandbox pour l'instant).

const AT_BASE_URL =
  process.env.AT_USERNAME === "sandbox"
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";

// Met un numéro ivoirien au format international +225XXXXXXXXXX.
function formatPhoneCI(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("225") && digits.length === 13) return "+" + digits;
  if (digits.length === 10) return "+225" + digits;
  if (digits.length === 8) return "+225" + digits;
  return "+" + digits;
}

// Fonction interne : envoie un SMS à un numéro. Ne lève JAMAIS d'erreur.
async function sendSms(rawPhone: string, message: string, label: string): Promise<void> {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;

  if (!apiKey || !username) {
    console.warn(`[SMS:${label}] AT_API_KEY ou AT_USERNAME manquant — non envoyé.`);
    return;
  }
  if (!rawPhone) {
    console.warn(`[SMS:${label}] Numéro absent — non envoyé.`);
    return;
  }

  const to = formatPhoneCI(rawPhone);
  const body = new URLSearchParams({ username, to, message });
  if (process.env.AT_SENDER_ID) body.append("from", process.env.AT_SENDER_ID);

  try {
    const res = await fetch(AT_BASE_URL, {
      method: "POST",
      headers: {
        apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });
    const raw = await res.text();
    if (!res.ok) {
      console.error(`[SMS:${label}] Erreur HTTP ${res.status} — ${raw}`);
      return;
    }
    console.log(`[SMS:${label}] Envoyé ✅ vers ${to}`);
  } catch (error) {
    console.error(`[SMS:${label}] Échec réseau:`, error);
  }
}

type OrderSmsInput = {
  phone: string;
  orderId: string | number;
  customerName?: string;
  total: number;
};

// 1) SMS de confirmation envoyé au CLIENT.
export async function sendOrderConfirmationSms(input: OrderSmsInput): Promise<void> {
  const { phone, orderId, customerName, total } = input;
  const bonjour = customerName ? `Bonjour ${customerName}, ` : "Bonjour, ";
  const message =
    `${bonjour}votre commande LIMAK n°${orderId} est bien reçue ` +
    `(total ${Number(total).toLocaleString("fr-FR")} FCFA). ` +
    `Paiement à la livraison. Merci pour votre confiance !`;
  await sendSms(phone, message, "client");
}

type AdminAlertInput = {
  orderId: string | number;
  customerName: string;
  customerPhone: string;
  shippingCity: string;
  total: number;
  itemCount: number;
};

// 2) Alerte envoyée à TOI (l'admin) à chaque nouvelle commande.
export async function sendAdminOrderAlertSms(input: AdminAlertInput): Promise<void> {
  const adminPhone = process.env.ADMIN_PHONE;
  if (!adminPhone) {
    console.warn("[SMS:admin] ADMIN_PHONE manquant dans .env — alerte non envoyée.");
    return;
  }
  const { orderId, customerName, customerPhone, shippingCity, total, itemCount } = input;
  const message =
    `Nouvelle commande LIMAK n°${orderId} ! ` +
    `${customerName} (${customerPhone}), ${shippingCity}. ` +
    `${itemCount} article(s), total ${Number(total).toLocaleString("fr-FR")} FCFA.`;
  await sendSms(adminPhone, message, "admin");
}