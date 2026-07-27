// ============================================================
//  SCRIPT DE NETTOYAGE DES IMAGES (à lancer UNE SEULE FOIS)
//  - renomme dossiers/fichiers de public/ (sans accents, sans
//    espaces, en minuscules)
//  - met à jour les adresses d'images en base pour rester cohérent
//  Les images hébergées sur UploadThing (http...) ne sont PAS touchées.
// ============================================================

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Règle de nettoyage d'UN segment (un nom de dossier ou de fichier)
function cleanSeg(seg: string): string {
  return seg
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-") // tout sauf minuscules/chiffres/point -> tiret
    .replace(/-+/g, "-") // pas de doubles tirets
    .replace(/^-|-$/g, "") // pas de tiret au début/fin
    .replace(/-\./g, "."); // pas de tiret juste avant l'extension
}

const PUBLIC_DIR = path.resolve("public");

// Parcourt public/ et liste tous les dossiers et fichiers
function walk(dir: string, acc: { full: string; dir: string; name: string }[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
    }
    acc.push({ full, dir, name: entry.name });
  }
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ---------- 1) Renommer sur le disque ----------
  const entries: { full: string; dir: string; name: string }[] = [];
  walk(PUBLIC_DIR, entries);
  // Du plus profond au moins profond (pour renommer enfants avant parents)
  entries.sort((a, b) => b.full.length - a.full.length);

  let renamed = 0;
  for (const e of entries) {
    const cleaned = cleanSeg(e.name);
    if (cleaned === e.name) continue;

    const target = path.join(e.dir, cleaned);
    const tmp = path.join(e.dir, cleaned + ".__tmp__");
    try {
      // Renommage en 2 temps (gère les changements de casse sous Windows)
      fs.renameSync(e.full, tmp);
      fs.renameSync(tmp, target);
      renamed++;
    } catch (err) {
      console.error("Erreur renommage:", e.full, (err as Error).message);
    }
  }
  console.log(`✅ Fichiers/dossiers renommés : ${renamed}`);

  // ---------- 2) Mettre à jour la base ----------
  const images = await prisma.productImage.findMany();
  let updated = 0;
  for (const img of images) {
    if (!img.url || img.url.startsWith("http")) continue; // UploadThing : on ne touche pas
    const cleaned =
      "/" + img.url.replace(/^\//, "").split("/").map(cleanSeg).join("/");
    if (cleaned !== img.url) {
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: cleaned },
      });
      updated++;
    }
  }
  console.log(`✅ Adresses d'images mises à jour en base : ${updated}`);
  console.log("Terminé. Tu peux rafraîchir localhost:3000/produits pour vérifier.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erreur :", e);
    await prisma.$disconnect();
    process.exit(1);
  });
