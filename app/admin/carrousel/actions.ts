// ============================================================
//  ACTIONS ADMIN — diapositives et réglages du carrousel d'accueil
// ============================================================

"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export type SlideInput = {
  type: "image" | "texte";
  imageUrl: string | null;
  alt: string | null;
  title: string | null;
  subtitle: string | null;
  badge: string | null;
  href: string;
};

function revalider() {
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}

export async function createSlide(input: SlideInput) {
  if (input.type === "image" && !input.imageUrl) {
    throw new Error("Une image est requise pour ce type de diapositive.");
  }
  if (input.type === "texte" && !input.title?.trim()) {
    throw new Error("Le titre est requis pour ce type de diapositive.");
  }

  const count = await prisma.heroSlide.count();
  const slide = await prisma.heroSlide.create({
    data: {
      type: input.type,
      imageUrl: input.imageUrl || null,
      alt: input.alt || null,
      title: input.title || null,
      subtitle: input.subtitle || null,
      badge: input.badge || null,
      href: input.href.trim() || "/produits",
      position: count,
    },
  });
  revalider();
  return slide;
}

export async function updateSlide(id: string, input: SlideInput) {
  if (!id) return;
  await prisma.heroSlide.update({
    where: { id },
    data: {
      type: input.type,
      imageUrl: input.imageUrl || null,
      alt: input.alt || null,
      title: input.title || null,
      subtitle: input.subtitle || null,
      badge: input.badge || null,
      href: input.href.trim() || "/produits",
    },
  });
  revalider();
}

export async function deleteSlide(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!id) return { ok: false, error: "Diapositive introuvable." };
  await prisma.heroSlide.delete({ where: { id } });
  revalider();
  return { ok: true };
}

export async function toggleSlideActive(id: string, isActive: boolean) {
  if (!id) return;
  await prisma.heroSlide.update({ where: { id }, data: { isActive } });
  revalider();
}

// Échange la position avec la diapositive voisine (monter/descendre dans l'ordre).
export async function moveSlide(id: string, direction: "up" | "down") {
  const slides = await prisma.heroSlide.findMany({ orderBy: { position: "asc" } });
  const i = slides.findIndex((s) => s.id === id);
  if (i === -1) return;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= slides.length) return;

  await prisma.$transaction([
    prisma.heroSlide.update({ where: { id: slides[i].id }, data: { position: slides[j].position } }),
    prisma.heroSlide.update({ where: { id: slides[j].id }, data: { position: slides[i].position } }),
  ]);
  revalider();
}

export async function updateHeroSettings(heightVh: number, slideDuration: number) {
  const clampedHeight = Math.min(100, Math.max(20, Math.round(heightVh)));
  const clampedDuration = Math.min(15000, Math.max(2000, Math.round(slideDuration)));

  const existing = await prisma.heroSettings.findFirst();
  if (existing) {
    await prisma.heroSettings.update({
      where: { id: existing.id },
      data: { heightVh: clampedHeight, slideDuration: clampedDuration },
    });
  } else {
    await prisma.heroSettings.create({
      data: { heightVh: clampedHeight, slideDuration: clampedDuration },
    });
  }
  revalider();
}
