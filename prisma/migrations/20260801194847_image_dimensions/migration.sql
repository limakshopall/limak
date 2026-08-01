-- Dimensions réelles des photos (pour les afficher selon leur forme, sans les recadrer)
ALTER TABLE "ProductImage" ADD COLUMN "width" INTEGER;
ALTER TABLE "ProductImage" ADD COLUMN "height" INTEGER;
