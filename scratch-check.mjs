import "dotenv/config";
import { prisma } from "./app/lib/prisma.ts";
console.log(await prisma.stockAlert.findMany());
await prisma.$disconnect();
