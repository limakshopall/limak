// ============================================================
//  AJOUTER UNE CATÉGORIE (admin)
// ============================================================

import { createCategory } from "./actions";

type Option = { id: string; name: string };

export default function AddCategoryForm({ options }: { options: Option[] }) {
  return (
    <form
      action={createCategory}
      className="mt-4 flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-[#14213D]/20 p-3"
    >
      <div className="min-w-0 flex-1">
        <label className="block text-xs text-neutral-500 dark:text-gray-400">Nouvelle catégorie</label>
        <input
          name="name"
          placeholder="ex: Chaussures"
          required
          className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
        />
      </div>
      <div className="min-w-0 flex-1">
        <label className="block text-xs text-neutral-500 dark:text-gray-400">Catégorie parente</label>
        <select
          name="parentId"
          defaultValue=""
          className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
        >
          <option value="">— Aucune (catégorie principale) —</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-full bg-[#F1720A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#C95900]"
      >
        + Ajouter
      </button>
    </form>
  );
}
