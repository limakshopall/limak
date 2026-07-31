// ============================================================
//  LISTE DES VARIANTES D'UN PRODUIT (admin)
//  Chaque variante (couleur/taille/prix/stock) est modifiable
//  et supprimable individuellement.
// ============================================================

import { updateVariant } from "./actions";
import DeleteVariantButton from "./DeleteVariantButton";

type Variant = {
  id: string;
  name: string;
  color: string | null;
  size: string | null;
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
      {variants.map((v) => (
        <form
          key={v.id}
          action={updateVariant}
          className="rounded-lg border border-[#14213D]/10 bg-[#FBEEDA] p-3"
        >
          <input type="hidden" name="variantId" value={v.id} />
          <input type="hidden" name="productId" value={productId} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div>
              <label className="block text-xs text-neutral-500">Couleur</label>
              <input
                name="color"
                defaultValue={v.color ?? ""}
                placeholder="ex: Rouge"
                className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500">Taille</label>
              <input
                name="size"
                defaultValue={v.size ?? ""}
                placeholder="ex: 42"
                className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500">Prix (FCFA)</label>
              <input
                name="price"
                type="number"
                defaultValue={v.price}
                className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500">Stock</label>
              <input
                name="stock"
                type="number"
                defaultValue={v.stock}
                className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500">Promo (FCFA)</label>
              <input
                name="comparePrice"
                type="number"
                defaultValue={v.comparePrice ?? ""}
                placeholder="Vide = non"
                className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-xs text-neutral-500">
              Prix fournisseur (FCFA) <span className="text-[#14213D]/40">— interne, jamais visible client</span>
            </label>
            <input
              name="costPrice"
              type="number"
              defaultValue={v.costPrice ?? ""}
              placeholder="Facultatif"
              className="mt-1 w-full max-w-xs rounded border border-[#14213D]/15 bg-[#FBEEDA] px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
            />
          </div>

          <div className="mt-2 flex items-center gap-4">
            <button
              type="submit"
              className="rounded-full bg-[#14213D] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#14213D]/85"
            >
              Enregistrer
            </button>
            <DeleteVariantButton variantId={v.id} productId={productId} />
          </div>
        </form>
      ))}
    </div>
  );
}
