// ============================================================
//  PRIX UNIFORME POUR TOUTES LES VARIANTES — Client Component
//  Pratique pour un article décliné en tailles/couleurs qui doit
//  garder le même prix partout. Ne supprime pas la possibilité de
//  modifier ensuite chaque variante individuellement ci-dessous.
// ============================================================

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAllVariantsPricing } from "./actions";

export default function BulkPricingForm({ productId, nbVariantes }: { productId: string; nbVariantes: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const ok = window.confirm(
      `Appliquer ce prix aux ${nbVariantes} variantes de cet article ? Les prix déjà réglés individuellement seront remplacés.`
    );
    if (!ok) return;

    startTransition(async () => {
      await updateAllVariantsPricing(formData);
      router.refresh();
    });
  }

  return (
    <form
      action={handleSubmit}
      className="mb-3 rounded-lg border border-dashed border-[#14213D]/25 bg-[#FFFBF3] p-3 dark:border-white/20 dark:bg-[#05070d]"
    >
      <input type="hidden" name="productId" value={productId} />
      <p className="mb-2 text-sm font-medium text-[#14213D] dark:text-gray-300">
        Fixer un prix pour toutes les variantes ({nbVariantes})
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs text-neutral-500 dark:text-gray-400">Prix (FCFA)</label>
          <input
            name="price"
            type="number"
            required
            className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#1c2333] dark:text-gray-300"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 dark:text-gray-400">Promo (FCFA)</label>
          <input
            name="comparePrice"
            type="number"
            placeholder="Vide = non"
            className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#1c2333] dark:text-gray-300"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 dark:text-gray-400">
            Prix fournisseur <span className="text-[#14213D]/40 dark:text-gray-400">— interne</span>
          </label>
          <input
            name="costPrice"
            type="number"
            placeholder="Facultatif"
            className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#1c2333] dark:text-gray-300"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-full bg-[#F1720A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#C95900] disabled:opacity-50"
      >
        {isPending ? "Application…" : "Appliquer à toutes les variantes"}
      </button>
      <p className="mt-1 text-xs text-neutral-400 dark:text-gray-500">
        Le stock n&apos;est pas touché. Tu peux ensuite ajuster chaque variante individuellement ci-dessous.
      </p>
    </form>
  );
}
