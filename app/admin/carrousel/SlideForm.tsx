// ============================================================
//  FORMULAIRE D'UNE DIAPOSITIVE (admin) — Client Component
//  Utilisé pour créer ET modifier une diapositive du carrousel.
//  Type "image" : upload + lien. Type "texte" : titre/accroche/badge/lien.
// ============================================================

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadButton } from "../../lib/uploadthing";
import { createSlide, updateSlide, type SlideInput } from "./actions";

type Slide = {
  id: string;
  type: string;
  imageUrl: string | null;
  alt: string | null;
  title: string | null;
  subtitle: string | null;
  badge: string | null;
  href: string;
};

export default function SlideForm({
  slide,
  onDone,
}: {
  slide?: Slide;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erreur, setErreur] = useState("");

  const [type, setType] = useState<"image" | "texte">((slide?.type as "image" | "texte") ?? "image");
  const [imageUrl, setImageUrl] = useState(slide?.imageUrl ?? "");
  const [alt, setAlt] = useState(slide?.alt ?? "");
  const [title, setTitle] = useState(slide?.title ?? "");
  const [subtitle, setSubtitle] = useState(slide?.subtitle ?? "");
  const [badge, setBadge] = useState(slide?.badge ?? "");
  const [href, setHref] = useState(slide?.href ?? "/produits");

  function valider() {
    setErreur("");
    if (type === "image" && !imageUrl) {
      setErreur("Ajoute une image pour cette diapositive.");
      return;
    }
    if (type === "texte" && !title.trim()) {
      setErreur("Le titre est requis.");
      return;
    }

    const input: SlideInput = {
      type,
      imageUrl: type === "image" ? imageUrl : null,
      alt: alt || null,
      title: type === "texte" ? title : null,
      subtitle: type === "texte" ? subtitle : null,
      badge: type === "texte" ? badge : null,
      href,
    };

    startTransition(async () => {
      try {
        if (slide) {
          await updateSlide(slide.id, input);
        } else {
          await createSlide(input);
          // formulaire de création : on vide pour permettre d'en ajouter une autre
          setImageUrl("");
          setAlt("");
          setTitle("");
          setSubtitle("");
          setBadge("");
          setHref("/produits");
          setType("image");
        }
        router.refresh();
        onDone?.();
      } catch (err) {
        setErreur(err instanceof Error ? err.message : "Erreur.");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-[#14213D]/10 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333]">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("image")}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            type === "image" ? "bg-[#14213D] text-white" : "border border-[#14213D]/20 text-[#14213D] dark:text-gray-300"
          }`}
        >
          Image
        </button>
        <button
          type="button"
          onClick={() => setType("texte")}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            type === "texte" ? "bg-[#14213D] text-white" : "border border-[#14213D]/20 text-[#14213D] dark:text-gray-300"
          }`}
        >
          Texte accrocheur
        </button>
      </div>

      {type === "image" ? (
        <div>
          {imageUrl && (
            <div className="relative mb-2 aspect-[16/6] w-full overflow-hidden rounded-lg bg-white dark:bg-[#05070d]">
              <Image src={imageUrl} alt="" fill className="object-cover" sizes="400px" />
            </div>
          )}
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.ufsUrl;
              if (url) setImageUrl(url);
            }}
            onUploadError={(err: Error) => setErreur(`Erreur d'image : ${err.message}`)}
          />
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Texte alternatif (accessibilité)"
            className="mt-2 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <input
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="Badge (ex: 🇨🇮 Livraison rapide)"
            className="w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre accrocheur"
            className="w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
          />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Accroche (sous-titre)"
            className="w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
          />
        </div>
      )}

      <input
        value={href}
        onChange={(e) => setHref(e.target.value)}
        placeholder="Lien (ex: /produits?categorie=montres)"
        className="w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
      />

      {erreur && <p className="text-xs font-medium text-[#D6293E]">{erreur}</p>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={valider}
          className="rounded-full bg-[#F1720A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#C95900] disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : slide ? "Enregistrer" : "+ Ajouter la diapositive"}
        </button>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm text-neutral-500 hover:text-[#14213D] dark:text-gray-400">
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
