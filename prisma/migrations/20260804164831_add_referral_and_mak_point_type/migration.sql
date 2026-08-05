-- CreateEnum
CREATE TYPE "MakPointEntryType" AS ENUM ('ACHAT', 'PARRAINAGE');

-- DropIndex
DROP INDEX "MakPointEntry_orderId_key";

-- AlterTable
ALTER TABLE "MakPointEntry" ADD COLUMN     "type" "MakPointEntryType" NOT NULL DEFAULT 'ACHAT';

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerClerkUserId" TEXT NOT NULL,
    "refereeClerkUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referral_refereeClerkUserId_key" ON "Referral"("refereeClerkUserId");

-- CreateIndex
CREATE INDEX "Referral_referrerClerkUserId_idx" ON "Referral"("referrerClerkUserId");

-- CreateIndex
CREATE INDEX "MakPointEntry_orderId_idx" ON "MakPointEntry"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "MakPointEntry_clerkUserId_orderId_type_key" ON "MakPointEntry"("clerkUserId", "orderId", "type");

