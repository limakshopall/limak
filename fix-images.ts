// ============================================================
//  SCRIPT DE CORRECTION DES IMAGES (à lancer UNE FOIS)
//  - supprime les dossiers/fichiers parasites ".__tmp__"
//  - renomme proprement tout ce qui reste (majuscules, espaces,
//    accents), y compris les changements de simple casse
//  - re-synchronise la base
//  Sûr à relancer plusieurs fois.
// ============================================================

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function cleanSeg(seg: string): string {
  return seg
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-\./g, ".");
}

const PUBLIC_DIR = path.resolve("public");

function walk(dir: string, acc: { full: string; dir: string; name: string; isDir: boolean }[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    acc.push({ full, dir, name: entry.name, isDir: entry.isDirectory() });
  }
}

// Renommage robuste, y compris quand seule la casse change (Windows).
function safeRename(from: string, to: string) {
  if (from === to) return;
  // Passage par un nom intermédiaire vraiment unique
  const tmp = path.join(path.dirname(from), "__ren__" + Date.now() + "__" + Math.random().toString(36).slice(2));
  fs.renameSync(from, tmp);
  fs.renameSync(tmp, to);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ---------- 1) Supprimer les parasites ".__tmp__" ----------
  let entries: { full: string; dir: string; name: string; isDir: boolean }[] = [];
  walk(PUBLIC_DIR, entries);
  entries.sort((a, b) => b.full.length - a.full.length); // plus profond d'abord

  let removed = 0;
  for (const e of entries) {
    if (e.name.includes("__tmp__") || e.name.includes("__ren__")) {
      try {
        fs.rmSync(e.full, { recursive: true, force: true });
        removed++;
      } catch {}
    }
  }
  console.log(`🗑️  Dossiers/fichiers parasites supprimés : ${removed}`);

  // ---------- 2) Renommer proprement ce qui reste ----------
  entries = [];
  walk(PUBLIC_DIR, entries);
  entries.sort((a, b) => b.full.length - a.full.length);

  let renamed = 0;
  for (const e of entries) {
    const cleaned = cleanSeg(e.name);
    if (cleaned === e.name) continue;
    const target = path.join(e.dir, cleaned);
    try {
      safeRename(e.full, target);
      renamed++;
    } catch (err) {
      console.error("Erreur:", e.full, "->", cleaned, (err as Error).message);
    }
  }
  console.log(`✅ Renommés proprement : ${renamed}`);

  // ---------- 3) Re-synchroniser la base ----------
  const images = await prisma.productImage.findMany();
  let updated = 0;
  for (const img of images) {
    if (!img.url || img.url.startsWith("http")) continue;
    const cleaned = "/" + img.url.replace(/^\//, "").split("/").map(cleanSeg).join("/");
    if (cleaned !== img.url) {
      await prisma.productImage.update({ where: { id: img.id }, data: { url: cleaned } });
      updated++;
    }
  }
  console.log(`✅ Adresses en base re-synchronisées : ${updated}`);
  console.log("Terminé.");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error("❌ Erreur :", e);
    await prisma.$disconnect();
    process.exit(1);
  });
