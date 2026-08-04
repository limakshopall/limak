import "dotenv/config";
import { PrismaClient } from "./app/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const p = await prisma.product.findUnique({ where: { slug: "pullover-jaune" }, include: { variants: true } });
console.log(JSON.stringify(p.variants, null, 2));
await prisma.$disconnect();
