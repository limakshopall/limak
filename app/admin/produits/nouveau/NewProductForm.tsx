// ============================================================
//  FORMULAIRE COMPLET DE CRÉATION D'ARTICLE (admin) — Client Component
//  Couleurs, tailles et leurs photos sont montées en mémoire (les photos
//  sont déjà envoyées sur UploadThing, seule l'URL est gardée) puis tout
//  est créé en une fois à la validation — inspiré du modèle Amazon :
//  couleurs et tailles sont indépendantes, chacune facultative.
// ============================================================

"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { UploadButton } from "../../../lib/uploadthing";
import { createProduct } from "./actions";
import CategoryPicker from "../CategoryPicker";
import { measureImage } from "../../../lib/measureImage";

type Categorie = { id: string; name: string; imageUrl: string | null };

type PhotoUploadee = { url: string; width: number | null; height: number | null };
type Couleur = { name: string; hex: string; images: PhotoUploadee[] };
type Taille = { name: string; images: PhotoUploadee[] };

function inputClass() {
  return "mt-1 w-full rounded-lg border border-[#14213D]/15 px-3 py-2 outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300";
}

function resolveComparePrice(compareRaw: string, price: number): number | null {
  const trimmed = compareRaw.trim();
  if (trimmed === "") return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed > price ? parsed : null;
}

function resolveCostPrice(costRaw: string): number | null {
  const trimmed = costRaw.trim();
  if (trimmed === "") return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function NewProductForm({ categories }: { categories: Categorie[] }) {
  const [erreur, setErreur] = useState("");
  const [pending, startTransition] = useTransition();

  const [images, setImages] = useState<PhotoUploadee[]>([]);
  const [colors, setColors] = useState<Couleur[]>([]);
  const [sizes, setSizes] = useState<Taille[]>([]);

  const [nomCouleur, setNomCouleur] = useState("");
  const [hexCouleur, setHexCouleur] = useState("#D6293E");
  const [nomTaille, setNomTaille] = useState("");

  const hasVariants = colors.length > 0 || sizes.length > 0;

  // Les combinaisons possibles à partir des couleurs/tailles saisies —
  // indépendantes : un produit peut n'avoir que des couleurs, que des
  // tailles, les deux, ou ni l'un ni l'autre.
  const combos = useMemo(() => {
    if (colors.length > 0 && sizes.length > 0) {
      return colors.flatMap((c, ci) =>
        sizes.map((s, si) => ({
          key: `${ci}-${si}`,
          colorIndex: ci,
          sizeIndex: si,
          label: `${c.name} / ${s.name}`,
        }))
      );
    }
    if (colors.length > 0) {
      return colors.map((c, ci) => ({ key: `${ci}-x`, colorIndex: ci, sizeIndex: null, label: c.name }));
    }
    if (sizes.length > 0) {
      return sizes.map((s, si) => ({ key: `x-${si}`, colorIndex: null, sizeIndex: si, label: s.name }));
    }
    return [] as { key: string; colorIndex: number | null; sizeIndex: number | null; label: string }[];
  }, [colors, sizes]);

  function ajouterCouleur() {
    if (!nomCouleur.trim()) return;
    setColors((prev) => [...prev, { name: nomCouleur.trim(), hex: hexCouleur, images: [] }]);
    setNomCouleur("");
  }

  function supprimerCouleur(index: number) {
    setColors((prev) => prev.filter((_, i) => i !== index));
  }

  function ajouterPhotoCouleur(index: number, photo: PhotoUploadee) {
    setColors((prev) => prev.map((c, i) => (i === index ? { ...c, images: [...c.images, photo] } : c)));
  }

  function supprimerPhotoCouleur(index: number, url: string) {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, images: c.images.filter((p) => p.url !== url) } : c))
    );
  }

  function ajouterTaille() {
    if (!nomTaille.trim()) return;
    setSizes((prev) => [...prev, { name: nomTaille.trim(), images: [] }]);
    setNomTaille("");
  }

  function supprimerTaille(index: number) {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  }

  function ajouterPhotoTaille(index: number, photo: PhotoUploadee) {
    setSizes((prev) => prev.map((s, i) => (i === index ? { ...s, images: [...s.images, photo] } : s)));
  }

  function supprimerPhotoTaille(index: number, url: string) {
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, images: s.images.filter((p) => p.url !== url) } : s))
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    if (!name) {
      setErreur("Le nom est requis.");
      return;
    }
    const categoryId = String(fd.get("categoryId") ?? "") || null;
    const description = String(fd.get("description") ?? "").trim() || null;

    const basePrice = parseInt(String(fd.get("price") ?? ""), 10);
    const baseStock = parseInt(String(fd.get("stock") ?? ""), 10);

    const variants = combos.map((combo) => {
      const price = parseInt(String(fd.get(`price-${combo.key}`) ?? ""), 10);
      return {
        colorIndex: combo.colorIndex,
        sizeIndex: combo.sizeIndex,
        price: Number.isFinite(price) ? price : 0,
        stock: parseInt(String(fd.get(`stock-${combo.key}`) ?? ""), 10) || 0,
        comparePrice: resolveComparePrice(
          String(fd.get(`comparePrice-${combo.key}`) ?? ""),
          Number.isFinite(price) ? price : 0
        ),
        costPrice: resolveCostPrice(String(fd.get(`costPrice-${combo.key}`) ?? "")),
      };
    });

    startTransition(async () => {
      try {
        await createProduct({
          name,
          categoryId,
          description,
          images,
          colors: colors.map((c) => ({ name: c.name, hex: c.hex || null, images: c.images })),
          sizes: sizes.map((s) => ({ name: s.name, images: s.images })),
          basePrice: Number.isFinite(basePrice) ? basePrice : 0,
          baseStock: Number.isFinite(baseStock) ? baseStock : 0,
          baseComparePrice: resolveComparePrice(
            String(fd.get("comparePrice") ?? ""),
            Number.isFinite(basePrice) ? basePrice : 0
          ),
          baseCostPrice: resolveCostPrice(String(fd.get("costPrice") ?? "")),
          variants,
        });
      } catch (err) {
        // redirect() lève une erreur spéciale gérée par Next : on la laisse passer.
        if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
        setErreur(err instanceof Error ? err.message : "Erreur lors de la création.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-[#14213D]/10 bg-[#FFFBF3] p-4 shadow-sm dark:border-white/15 dark:bg-[#05070d]"
    >
      <div>
        <label className="block text-sm text-neutral-600 dark:text-gray-400">Nom</label>
        <input name="name" required className={inputClass()} />
      </div>

      <CategoryPicker categories={categories} />

      <div>
        <label className="block text-sm text-neutral-600 dark:text-gray-400">
          Description (facultatif)
        </label>
        <textarea name="description" rows={3} className={inputClass()} />
      </div>

      {/* --- PHOTOS GÉNÉRALES --- */}
      <div className="rounded-lg border border-dashed border-[#14213D]/20 p-3 dark:border-white/15">
        <p className="mb-2 text-sm font-medium text-[#14213D] dark:text-gray-300">Photos</p>
        <div className="flex flex-wrap items-start gap-2">
          {images.map((photo) => (
            <div key={photo.url} className="group relative h-20 w-20 shrink-0">
              <div className="relative h-full w-full overflow-hidden rounded-lg bg-white dark:bg-[#1c2333]">
                <Image src={photo.url} alt="" fill className="object-contain" sizes="80px" />
              </div>
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((p) => p.url !== photo.url))}
                className="absolute right-1 top-1 rounded bg-[#14213D]/70 px-1.5 text-xs text-white hover:bg-[#D6293E]"
                aria-label="Supprimer la photo"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="w-40 shrink-0">
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={async (res) => {
                const url = res?.[0]?.ufsUrl;
                if (url) {
                  const dims = await measureImage(url).catch(() => null);
                  setImages((prev) => [...prev, { url, width: dims?.width ?? null, height: dims?.height ?? null }]);
                }
              }}
              onUploadError={(err: Error) => setErreur(`Erreur d'image : ${err.message}`)}
            />
          </div>
        </div>
      </div>

      {/* --- COULEURS (facultatif, indépendant des tailles) --- */}
      <div className="rounded-lg border border-dashed border-[#14213D]/20 p-3 dark:border-white/15">
        <p className="mb-2 text-sm font-medium text-[#14213D] dark:text-gray-300">
          Couleurs <span className="font-normal text-neutral-400">(facultatif)</span>
        </p>

        <div className="space-y-3">
          {colors.map((c, i) => (
            <div
              key={i}
              className="rounded-lg border border-[#14213D]/10 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border border-[#14213D]/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="font-medium text-[#14213D] dark:text-gray-300">{c.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => supprimerCouleur(i)}
                  className="text-xs font-medium text-[#D6293E] hover:underline"
                >
                  Supprimer
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-start gap-2">
                {c.images.map((photo) => (
                  <div key={photo.url} className="group relative h-20 w-20 shrink-0">
                    <div className="relative h-full w-full overflow-hidden rounded-lg bg-white dark:bg-[#1c2333]">
                      <Image src={photo.url} alt="" fill className="object-contain" sizes="80px" />
                    </div>
                    <button
                      type="button"
                      onClick={() => supprimerPhotoCouleur(i, photo.url)}
                      className="absolute right-1 top-1 rounded bg-[#14213D]/70 px-1.5 text-xs text-white hover:bg-[#D6293E]"
                      aria-label="Supprimer la photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="w-40 shrink-0">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={async (res) => {
                      const url = res?.[0]?.ufsUrl;
                      if (url) {
                        const dims = await measureImage(url).catch(() => null);
                        ajouterPhotoCouleur(i, { url, width: dims?.width ?? null, height: dims?.height ?? null });
                      }
                    }}
                    onUploadError={(err: Error) => setErreur(`Erreur d'image : ${err.message}`)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={nomCouleur}
            onChange={(e) => setNomCouleur(e.target.value)}
            placeholder="ex: Rouge"
            className="rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
          />
          <input
            type="color"
            value={hexCouleur}
            onChange={(e) => setHexCouleur(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border border-[#14213D]/15 dark:border-white/15"
            aria-label="Couleur d'affichage"
          />
          <button
            type="button"
            onClick={ajouterCouleur}
            className="rounded-full bg-[#F1720A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#C95900]"
          >
            + Ajouter une couleur
          </button>
        </div>
      </div>

      {/* --- TAILLES (facultatif, indépendant des couleurs) --- */}
      <div className="rounded-lg border border-dashed border-[#14213D]/20 p-3 dark:border-white/15">
        <p className="mb-2 text-sm font-medium text-[#14213D] dark:text-gray-300">
          Tailles <span className="font-normal text-neutral-400">(facultatif)</span>
        </p>

        <div className="space-y-3">
          {sizes.map((s, i) => (
            <div
              key={i}
              className="rounded-lg border border-[#14213D]/10 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333]"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#14213D] dark:text-gray-300">{s.name}</span>
                <button
                  type="button"
                  onClick={() => supprimerTaille(i)}
                  className="text-xs font-medium text-[#D6293E] hover:underline"
                >
                  Supprimer
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-start gap-2">
                {s.images.map((photo) => (
                  <div key={photo.url} className="group relative h-20 w-20 shrink-0">
                    <div className="relative h-full w-full overflow-hidden rounded-lg bg-white dark:bg-[#1c2333]">
                      <Image src={photo.url} alt="" fill className="object-contain" sizes="80px" />
                    </div>
                    <button
                      type="button"
                      onClick={() => supprimerPhotoTaille(i, photo.url)}
                      className="absolute right-1 top-1 rounded bg-[#14213D]/70 px-1.5 text-xs text-white hover:bg-[#D6293E]"
                      aria-label="Supprimer la photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="w-40 shrink-0">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={async (res) => {
                      const url = res?.[0]?.ufsUrl;
                      if (url) {
                        const dims = await measureImage(url).catch(() => null);
                        ajouterPhotoTaille(i, { url, width: dims?.width ?? null, height: dims?.height ?? null });
                      }
                    }}
                    onUploadError={(err: Error) => setErreur(`Erreur d'image : ${err.message}`)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={nomTaille}
            onChange={(e) => setNomTaille(e.target.value)}
            placeholder="ex: M ou 42"
            className="rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
          />
          <button
            type="button"
            onClick={ajouterTaille}
            className="rounded-full bg-[#F1720A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#C95900]"
          >
            + Ajouter une taille
          </button>
        </div>
      </div>

      {/* --- PRIX / STOCK : unique si pas de couleur/taille, sinon grille par combinaison --- */}
      {!hasVariants ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-600 dark:text-gray-400">Prix (FCFA)</label>
              <input name="price" type="number" defaultValue={0} className={inputClass()} />
            </div>
            <div>
              <label className="block text-sm text-neutral-600 dark:text-gray-400">Stock</label>
              <input name="stock" type="number" defaultValue={0} className={inputClass()} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-600 dark:text-gray-400">
              Prix promo (FCFA) <span className="text-neutral-400">(facultatif)</span>
            </label>
            <input name="comparePrice" type="number" placeholder="Vide = pas de promo" className={inputClass()} />
          </div>
          <div className="rounded-lg border border-dashed border-[#14213D]/20 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333]">
            <label className="block text-sm text-neutral-600 dark:text-gray-400">Prix fournisseur (FCFA)</label>
            <input name="costPrice" type="number" placeholder="Facultatif" className={inputClass()} />
            <p className="mt-1 text-xs text-neutral-400 dark:text-gray-400">
              Usage interne uniquement — jamais visible par les clients.
            </p>
          </div>
        </>
      ) : (
        <div>
          <p className="mb-2 text-sm font-medium text-[#14213D] dark:text-gray-300">
            Prix / stock par combinaison
          </p>
          <div className="space-y-3">
            {combos.map((combo) => (
              <div
                key={combo.key}
                className="rounded-lg border border-[#14213D]/10 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333]"
              >
                <p className="mb-2 text-sm font-semibold text-[#14213D] dark:text-gray-300">{combo.label}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs text-neutral-500 dark:text-gray-400">Prix (FCFA)</label>
                    <input
                      name={`price-${combo.key}`}
                      type="number"
                      defaultValue={0}
                      className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 dark:text-gray-400">Stock</label>
                    <input
                      name={`stock-${combo.key}`}
                      type="number"
                      defaultValue={0}
                      className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 dark:text-gray-400">Promo (FCFA)</label>
                    <input
                      name={`comparePrice-${combo.key}`}
                      type="number"
                      placeholder="Vide = non"
                      className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 dark:text-gray-400">
                      Prix fournisseur <span className="text-[#14213D]/40 dark:text-gray-400">— interne</span>
                    </label>
                    <input
                      name={`costPrice-${combo.key}`}
                      type="number"
                      placeholder="Facultatif"
                      className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {erreur && <p className="text-sm font-medium text-[#D6293E]">{erreur}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[#F1720A] px-6 py-3 font-semibold text-white transition hover:bg-[#C95900] disabled:opacity-50"
      >
        {pending ? "Création…" : "Créer l'article"}
      </button>
    </form>
  );
}
