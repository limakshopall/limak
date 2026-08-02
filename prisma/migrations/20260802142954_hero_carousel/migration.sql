-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "imageUrl" TEXT,
    "alt" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "badge" TEXT,
    "href" TEXT NOT NULL DEFAULT '/produits',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSettings" (
    "id" TEXT NOT NULL,
    "heightVh" INTEGER NOT NULL DEFAULT 45,
    "slideDuration" INTEGER NOT NULL DEFAULT 5000,

    CONSTRAINT "HeroSettings_pkey" PRIMARY KEY ("id")
);
