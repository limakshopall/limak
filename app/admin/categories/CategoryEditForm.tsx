// ============================================================
//  MODIFIER UNE CATÉGORIE (admin) — nom + catégorie parente + suppression
// ============================================================

import { updateCategory } from "./actions";
import DeleteCategoryButton from "./DeleteCategoryButton";

type Option = { id: string; name: string };

export default function CategoryEditForm({
  id,
  name,
  parentId,
  options,
}: {
  id: string;
  name: string;
  parentId: string | null;
  options: Option[];
}) {
  return (
    <form action={updateCategory} className="flex flex-1 flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={id} />

      <div className="min-w-0 flex-1">
        <label className="block text-xs text-neutral-500 dark:text-gray-400">Nom</label>
        <input
          name="name"
          defaultValue={name}
          className="mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300"
        />
      </div>

      <div className="min-w-0 flex-1">
        <label className="block text-xs text-neutral-500 dark:text-gray-400">Catégorie parente</label>
        <select
          name="parentId"
          defaultValue={parentId ?? ""}
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
        className="rounded-full bg-[#14213D] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#14213D]/85"
      >
        Enregistrer
      </button>

      <DeleteCategoryButton id={id} name={name} />
    </form>
  );
}
