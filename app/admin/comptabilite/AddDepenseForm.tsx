// ============================================================
//  AJOUTER UNE DÉPENSE (admin)
// ============================================================

import { createDepense } from "./actions";

const champ =
  "mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300";
const label = "block text-xs text-neutral-500 dark:text-gray-400";

export default function AddDepenseForm() {
  const aujourdhui = new Date().toISOString().slice(0, 10);

  return (
    <form
      action={createDepense}
      className="grid grid-cols-2 gap-2 rounded-lg border border-dashed border-[#14213D]/20 p-3 sm:grid-cols-3 lg:grid-cols-7"
    >
      <div className="col-span-2 lg:col-span-2">
        <label className={label}>Motif</label>
        <input name="motif" placeholder="ex: Achat 20 casquettes" required className={champ} />
      </div>
      <div>
        <label className={label}>Catégorie</label>
        <input name="categorie" placeholder="Achat stock" defaultValue="Autre" className={champ} />
      </div>
      <div>
        <label className={label}>Montant (FCFA)</label>
        <input name="montant" type="number" min={1} placeholder="15000" required className={champ} />
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
        <label className={label}>Source du fond</label>
        <input name="source" placeholder="Caisse LIMAK" required className={champ} />
      </div>
      <div className="col-span-2 sm:col-span-3 lg:col-span-7">
        <label className={label}>Note (facultatif)</label>
        <input name="note" placeholder="Détail complémentaire..." className={champ} />
      </div>
      <div className="col-span-2 sm:col-span-3 lg:col-span-7">
        <button
          type="submit"
          className="rounded-full bg-[#F1720A] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#C95900]"
        >
          + Ajouter la dépense
        </button>
      </div>
    </form>
  );
}
