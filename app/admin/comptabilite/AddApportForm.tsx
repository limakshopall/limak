// ============================================================
//  AJOUTER UN APPORT EXTÉRIEUR (admin)
// ============================================================

import { createApport } from "./actions";

const champ =
  "mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300";
const label = "block text-xs text-neutral-500 dark:text-gray-400";

export default function AddApportForm() {
  const aujourdhui = new Date().toISOString().slice(0, 10);

  return (
    <form
      action={createApport}
      className="grid grid-cols-2 gap-2 rounded-lg border border-dashed border-[#14213D]/20 p-3 sm:grid-cols-4"
    >
      <div>
        <label className={label}>Montant (FCFA)</label>
        <input name="montant" type="number" min={1} placeholder="100000" required className={champ} />
      </div>
      <div>
        <label className={label}>Date</label>
        <input name="date" type="date" defaultValue={aujourdhui} required className={champ} />
      </div>
      <div>
        <label className={label}>Personne</label>
        <input name="personne" placeholder="Abdallah" required className={champ} />
      </div>
      <div>
        <label className={label}>Motif (facultatif)</label>
        <input name="motif" placeholder="Apport personnel" className={champ} />
      </div>
      <div className="col-span-2 sm:col-span-4">
        <button
          type="submit"
          className="rounded-full bg-[#F1720A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#C95900]"
        >
          + Ajouter l&apos;apport
        </button>
      </div>
    </form>
  );
}
