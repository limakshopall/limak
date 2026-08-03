-- CreateTable
CREATE TABLE "MakPointEntry" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MakPointEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MakPointEntry_orderId_key" ON "MakPointEntry"("orderId");

-- CreateIndex
CREATE INDEX "MakPointEntry_clerkUserId_idx" ON "MakPointEntry"("clerkUserId");
