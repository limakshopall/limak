// ============================================================
//  DIAGNOSTIC IMAGES (ne modifie RIEN) — juste pour comprendre
//  Compare les adresses en base avec les fichiers réels de public/
// ============================================================

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const images = await prisma.productImage.findMany();
  const local = images.filter((i) => i.url && !i.url.startsWith("http"));

  let ok = 0;
  const missing: string[] = [];

  for (const img of local) {
    // On enlève le "/" de début et on cherche le fichier dans public/
    const rel = img.url.replace(/^\//, "");
    const full = path.join(path.resolve("public"), rel);
    if (fs.existsSync(full)) {
      ok++;
    } else {
      missing.push(img.url);
    }
  }

  console.log("=== DIAGNOSTIC IMAGES ===");
  console.log("Images locales en base :", local.length);
  console.log("Fichiers trouvés       :", ok);
  console.log("Fichiers INTROUVABLES  :", missing.length);
  console.log("");
  console.log("--- 15 premières adresses introuvables ---");
  for (const m of missing.slice(0, 15)) console.log("  ", m);

  // Pour un exemple introuvable, on montre ce qui existe VRAIMENT dans le dossier
  if (missing.length > 0) {
    const rel = missing[0].replace(/^\//, "");
    const dir = path.join(path.resolve("public"), path.dirname(rel));
    console.log("");
    console.log("--- Exemple : adresse demandée ---");
    console.log("  ", missing[0]);
    console.log("--- Contenu RÉEL du dossier parent sur le disque ---");
    console.log("  Dossier:", path.dirname(rel));
    try {
      if (fs.existsSync(dir)) {
        for (const f of fs.readdirSync(dir)) console.log("   •", f);
      } else {
        console.log("  (ce dossier n'existe même pas — le problème est plus haut dans le chemin)");
        // Remonter et lister le premier dossier existant
        let probe = path.dirname(dir);
        while (probe.length > path.resolve("public").length && !fs.existsSync(probe)) {
          probe = path.dirname(probe);
        }
        console.log("  Premier dossier existant en remontant:", probe.replace(path.resolve("public"), "public"));
        for (const f of fs.readdirSync(probe)) console.log("   •", f);
      }
    } catch (e) {
      console.log("  Erreur lecture:", (e as Error).message);
    }
  }
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
