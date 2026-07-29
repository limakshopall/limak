// app/lib/sms.ts
// Envoi de SMS de confirmation via l'API Africa's Talking.
// Mode Sandbox pour l'instant (tests gratuits via le simulateur).

const AT_BASE_URL =
  process.env.AT_USERNAME === "sandbox"
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";

// Met un numéro ivoirien au format international +225XXXXXXXXXX.
function formatPhoneCI(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("225") && digits.length === 13) return "+" + digits;
  if (digits.length === 10) return "+225" + digits; // ex: 0717678784
  if (digits.length === 8) return "+225" + digits;
  return "+" + digits;
}

type OrderSmsInput = {
  phone: string;
  orderId: string | number;
  customerName?: string;
  total: number;
};

export async function sendOrderConfirmationSms(input: OrderSmsInput): Promise<void> {
  const { phone, orderId, customerName, total } = input;

  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;

  if (!apiKey || !username) {
    console.warn("[SMS] AT_API_KEY ou AT_USERNAME manquant — SMS non envoyé.");
    return;
  }
  if (!phone) {
    console.warn("[SMS] Numéro de téléphone absent — SMS non envoyé.");
    return;
  }

  const to = formatPhoneCI(phone);
  console.log("[SMS] Numéro formaté:", to, "| username:", username);

  const bonjour = customerName ? `Bonjour ${customerName}, ` : "Bonjour, ";
  const message =
    `${bonjour}votre commande LIMAK n°${orderId} est bien reçue ` +
    `(total ${Number(total).toLocaleString("fr-FR")} FCFA). ` +
    `Paiement à la livraison. Merci pour votre confiance !`;

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

    // On lit d'abord en TEXTE pour voir le vrai message même si ce n'est pas du JSON.
    const raw = await res.text();
    if (!res.ok) {
      console.error(`[SMS] Erreur HTTP ${res.status} — réponse: ${raw}`);
      return;
    }
    console.log("[SMS] Envoyé ✅ — réponse:", raw);
  } catch (error) {
    console.error("[SMS] Échec réseau:", error);
  }
}