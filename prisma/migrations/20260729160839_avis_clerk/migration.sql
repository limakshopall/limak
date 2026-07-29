/*
  Warnings:

  - You are about to drop the column `userId` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,clerkUserId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authorName` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerkUserId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropIndex
DROP INDEX "Review_productId_userId_key";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "userId",
ADD COLUMN     "authorName" TEXT NOT NULL,
ADD COLUMN     "clerkUserId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_productId_clerkUserId_key" ON "Review"("productId", "clerkUserId");
