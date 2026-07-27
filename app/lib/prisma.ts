import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// En Prisma 7, le client se crée avec un "adaptateur" qui gère la
// connexion à PostgreSQL. On lui donne l'URL de la base (lue depuis .env).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

// On réutilise une seule instance du client pour toute l'application
// (pour ne pas saturer la base de connexions en développement).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}