-- Nouvelles tables : couleurs et tailles déclinables par produit
CREATE TABLE "ProductColor" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductColor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductSize" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductColor_productId_idx" ON "ProductColor"("productId");
CREATE INDEX "ProductSize_productId_idx" ON "ProductSize"("productId");

ALTER TABLE "ProductColor" ADD CONSTRAINT "ProductColor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Nouvelles colonnes (encore nullable, les anciennes color/size restent en place pour l'instant)
ALTER TABLE "ProductVariant" ADD COLUMN "colorId" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN "sizeId" TEXT;
ALTER TABLE "ProductImage" ADD COLUMN "colorId" TEXT;

-- Migration des données existantes : convertit les valeurs texte color/size
-- (une seule variante concernée en prod à ce jour) en lignes ProductColor/ProductSize,
-- puis relie les variantes à ces nouvelles lignes.
INSERT INTO "ProductColor" ("id", "productId", "name", "hex", "position")
SELECT md5(random()::text || clock_timestamp()::text), t."productId", t."color", NULL, 0
FROM (SELECT DISTINCT "productId", "color" FROM "ProductVariant" WHERE "color" IS NOT NULL) t;

UPDATE "ProductVariant" v
SET "colorId" = c."id"
FROM "ProductColor" c
WHERE c."productId" = v."productId" AND c."name" = v."color" AND v."color" IS NOT NULL;

INSERT INTO "ProductSize" ("id", "productId", "name", "position")
SELECT md5(random()::text || clock_timestamp()::text || 's'), t."productId", t."size", 0
FROM (SELECT DISTINCT "productId", "size" FROM "ProductVariant" WHERE "size" IS NOT NULL) t;

UPDATE "ProductVariant" v
SET "sizeId" = s."id"
FROM "ProductSize" s
WHERE s."productId" = v."productId" AND s."name" = v."size" AND v."size" IS NOT NULL;

-- Les anciennes colonnes texte ne sont plus nécessaires
ALTER TABLE "ProductVariant" DROP COLUMN "color";
ALTER TABLE "ProductVariant" DROP COLUMN "size";

CREATE INDEX "ProductImage_colorId_idx" ON "ProductImage"("colorId");
CREATE INDEX "ProductVariant_colorId_idx" ON "ProductVariant"("colorId");
CREATE INDEX "ProductVariant_sizeId_idx" ON "ProductVariant"("sizeId");

ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "ProductColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "ProductColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "ProductSize"("id") ON DELETE CASCADE ON UPDATE CASCADE;
