// ============================================================
//  COMPTABILITÉ — actions serveur (dépenses, apports, statistiques)
// ============================================================

"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

function revalider() {
  revalidatePath("/admin/comptabilite");
}

// --- Statistiques (chiffre d'affaires, bénéfice, caisse...) ---
// Basé sur les commandes LIVRÉES uniquement (paiement à la livraison =
// encaissé à la livraison). Si un article a perdu sa variante (supprimée
// depuis), son coût d'achat est compté comme 0 — le bénéfice affiché est
// alors légèrement surestimé pour cette commande (signalé dans l'UI).
export async function getStatsComptables() {
  const commandesLivrees = await prisma.order.findMany({
    where: { status: "DELIVERED" },
    select: {
      total: true,
      coutTransport: true,
      items: {
        select: {
          quantity: true,
          variant: { select: { costPrice: true } },
          variantId: true,
        },
      },
    },
  });

  let chiffreAffaires = 0;
  let coutAchatTotal = 0;
  let coutTransportTotal = 0;
  let articlesSansCout = 0;

  for (const cmd of commandesLivrees) {
    chiffreAffaires += cmd.total;
    coutTransportTotal += cmd.coutTransport;
    for (const item of cmd.items) {
      if (item.variant?.costPrice != null) {
        coutAchatTotal += item.variant.costPrice * item.quantity;
      } else {
        articlesSansCout += item.quantity;
      }
    }
  }

  const benefice = chiffreAffaires - coutAchatTotal - coutTransportTotal;

  const [apports, depenses] = await Promise.all([
    prisma.apportExterieur.aggregate({ _sum: { montant: true } }),
    prisma.depense.aggregate({ _sum: { montant: true } }),
  ]);
  const totalApports = apports._sum.montant ?? 0;
  const totalDepenses = depenses._sum.montant ?? 0;
  const caisse = totalApports + chiffreAffaires - totalDepenses;

  return {
    nbCommandesLivrees: commandesLivrees.length,
    chiffreAffaires,
    coutAchatTotal,
    coutTransportTotal,
    benefice,
    totalApports,
    totalDepenses,
    caisse,
    articlesSansCout,
  };
}

// --- Dépenses ---
function lireChampsDepense(formData: FormData) {
  return {
    motif: String(formData.get("motif") ?? "").trim(),
    categorie: String(formData.get("categorie") ?? "").trim() || "Autre",
    montant: parseInt(String(formData.get("montant") ?? ""), 10),
    date: String(formData.get("date") ?? ""),
    personne: String(formData.get("personne") ?? "").trim(),
    source: String(formData.get("source") ?? "").trim(),
    note: String(formData.get("note") ?? "").trim() || null,
  };
}

export async function createDepense(formData: FormData): Promise<void> {
  const c = lireChampsDepense(formData);
  if (!c.motif || !c.montant || Number.isNaN(c.montant) || !c.date || !c.personne || !c.source) return;
  await prisma.depense.create({
    data: { ...c, montant: c.montant, date: new Date(c.date) },
  });
  revalider();
}

export async function updateDepense(id: string, formData: FormData): Promise<void> {
  const c = lireChampsDepense(formData);
  if (!c.motif || !c.montant || Number.isNaN(c.montant) || !c.date || !c.personne || !c.source) return;
  await prisma.depense.update({
    where: { id },
    data: { ...c, montant: c.montant, date: new Date(c.date) },
  });
  revalider();
}

export async function deleteDepense(id: string): Promise<{ ok: boolean }> {
  await prisma.depense.delete({ where: { id } });
  revalider();
  return { ok: true };
}

// --- Apports extérieurs ---
function lireChampsApport(formData: FormData) {
  return {
    montant: parseInt(String(formData.get("montant") ?? ""), 10),
    date: String(formData.get("date") ?? ""),
    personne: String(formData.get("personne") ?? "").trim(),
    motif: String(formData.get("motif") ?? "").trim() || null,
  };
}

export async function createApport(formData: FormData): Promise<void> {
  const c = lireChampsApport(formData);
  if (!c.montant || Number.isNaN(c.montant) || !c.date || !c.personne) return;
  await prisma.apportExterieur.create({
    data: { ...c, montant: c.montant, date: new Date(c.date) },
  });
  revalider();
}

export async function updateApport(id: string, formData: FormData): Promise<void> {
  const c = lireChampsApport(formData);
  if (!c.montant || Number.isNaN(c.montant) || !c.date || !c.personne) return;
  await prisma.apportExterieur.update({
    where: { id },
    data: { ...c, montant: c.montant, date: new Date(c.date) },
  });
  revalider();
}

export async function deleteApport(id: string): Promise<{ ok: boolean }> {
  await prisma.apportExterieur.delete({ where: { id } });
  revalider();
  return { ok: true };
}
