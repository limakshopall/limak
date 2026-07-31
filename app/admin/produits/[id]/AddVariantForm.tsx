// ============================================================
//  AJOUTER UNE VARIANTE (admin) — formulaire compact
// ============================================================

import { createVariant } from "./actions";

export default function AddVariantForm({ productId }: { productId: string }) {
  return (
    <form
      action={createVariant}
      className="mt-3 rounded-lg border border-dashed border-[#14213D]/20 p-3"
    >
      <input type="hidden" name="productId" value={productId} />
      <p className="mb-2 text-xs font-medium text-neutral-500">Ajouter une variante</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <input
          name="color"
          placeholder="Couleur (ex: Rouge)"
          className="rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
        />
        <input
          name="size"
          placeholder="Taille (ex: 42)"
          className="rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
        />
        <input
          name="price"
          type="number"
          placeholder="Prix"
          required
          className="rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
        />
        <input
          name="stock"
          type="number"
          placeholder="Stock"
          defaultValue={0}
          className="rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
        />
        <input
          name="comparePrice"
          type="number"
          placeholder="Promo (vide = non)"
          className="rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
        />
      </div>

      <input
        name="costPrice"
        type="number"
        placeholder="Prix fournisseur — interne (facultatif)"
        className="mt-2 w-full max-w-xs rounded border border-[#14213D]/15 bg-[#FBEEDA] px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A]"
      />

      <button
        type="submit"
        className="mt-2 rounded-full bg-[#F1720A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#C95900]"
      >
        + Ajouter la variante
      </button>
    </form>
  );
}
