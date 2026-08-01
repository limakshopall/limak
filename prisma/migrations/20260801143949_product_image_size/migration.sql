-- Photos rattachées à une taille précise (en plus de la couleur déjà supportée)
ALTER TABLE "ProductImage" ADD COLUMN "sizeId" TEXT;

CREATE INDEX "ProductImage_sizeId_idx" ON "ProductImage"("sizeId");

ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "ProductSize"("id") ON DELETE CASCADE ON UPDATE CASCADE;
