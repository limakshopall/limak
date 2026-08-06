// ============================================================
//  GRILLE DES VARIANTES D'UN PRODUIT (admin)
//  Une ligne par combinaison couleur/taille (générée automatiquement
//  à l'ajout/suppression d'une couleur ou taille). Seuls le prix,
//  le stock, la promo et le prix fournisseur sont modifiables ici.
// ============================================================

import { updateVariantPricing } from "./actions";
import BulkPricingForm from "./BulkPricingForm";

type Variant = {
  id: string;
  color: { name: string } | null;
  size: { name: string } | null;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  stock: number;
};

export default function VariantList({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  return (
    <div className="space-y-3">
      {variants.length > 1 && (
        <BulkPricingForm productId={productId} nbVariantes={variants.length} />
      )}

      {variants.map((v) => {
        const label = [v.color?.name, v.size?.name].filter(Boolean).join(" / ") || "Standard";
        return (
          <form
            // La clé inclut les valeurs : après un prix uniforme appliqué à
            // toutes les variantes (ou toute modif serveur), le formulaire est
            // reconstruit avec les nouvelles valeurs au lieu de garder l'ancien
            // contenu affiché (React ne rafraîchit pas defaultValue tout seul).
            key={`${v.id}-${v.price}-${v.comparePrice}-${v.costPrice}-${v.stock}`}
            action={updateVariantPricing}
            className="rounded-lg border border-[#14213D]/10 bg-[#FBEEDA] p-3 dark:border-white/15 dark:bg-[#1c2333]"
          >
            <input type="hidden" name="variantId" value={v.id} />
            <input type="hidden" name="productId" value={productId} />

            <p className="mb-2 text-sm font-semibold text-[#14213D] dark:text-gray-300">{label}</p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs text-neutral-500 dark:text-gray-400">Prix (FCFA)</label>
                <input
                  name="price"
                  type="number"
                  defaultValue={v.price}
                  className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 dark:text-gray-400">Stock</label>
                <input
                  name="stock"
                  type="number"
                  defaultValue={v.stock}
                  className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 dark:text-gray-400">Promo (FCFA)</label>
                <input
                  name="comparePrice"
                  type="number"
                  defaultValue={v.comparePrice ?? ""}
                  placeholder="Vide = non"
                  className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 dark:text-gray-400">
                  Prix fournisseur <span className="text-[#14213D]/40 dark:text-gray-400">— interne</span>
                </label>
                <input
                  name="costPrice"
                  type="number"
                  defaultValue={v.costPrice ?? ""}
                  placeholder="Facultatif"
                  className="mt-1 w-full rounded border border-[#14213D]/15 bg-[#FBEEDA] px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#1c2333] dark:text-gray-300"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 rounded-full bg-[#14213D] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#14213D]/85"
            >
              Enregistrer
            </button>
          </form>
        );
      })}
    </div>
  );
}
