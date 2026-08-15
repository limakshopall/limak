-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "coutTransport" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Depense" (
    "id" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "categorie" TEXT NOT NULL DEFAULT 'Autre',
    "montant" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "personne" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Depense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApportExterieur" (
    "id" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "personne" TEXT NOT NULL,
    "motif" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApportExterieur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Depense_date_idx" ON "Depense"("date");

-- CreateIndex
CREATE INDEX "Depense_categorie_idx" ON "Depense"("categorie");

-- CreateIndex
CREATE INDEX "ApportExterieur_date_idx" ON "ApportExterieur"("date");
