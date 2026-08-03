-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "giftForClerkUserId" TEXT,
ADD COLUMN     "giftFromName" TEXT,
ADD COLUMN     "giftMessage" TEXT,
ADD COLUMN     "isGift" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Order_giftForClerkUserId_idx" ON "Order"("giftForClerkUserId");
