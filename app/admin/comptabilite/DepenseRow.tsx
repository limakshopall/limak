// ============================================================
//  UNE LIGNE DE DÉPENSE — modifiable directement (comme CategoryEditForm)
// ============================================================

import { updateDepense } from "./actions";
import DeleteDepenseButton from "./DeleteDepenseButton";

const champ =
  "mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300";
const label = "block text-xs text-neutral-500 dark:text-gray-400";

type Props = {
  id: string;
  motif: string;
  categorie: string;
  montant: number;
  date: Date;
  personne: string;
  source: string;
  note: string | null;
};

export default function DepenseRow({ id, motif, categorie, montant, date, personne, source, note }: Props) {
  const updateAvecId = updateDepense.bind(null, id);

  return (
    <form
      action={updateAvecId}
      className="grid grid-cols-2 items-end gap-2 rounded-lg border border-[#14213D]/10 bg-[#FFFBF3] p-3 shadow-sm dark:border-white/15 dark:bg-[#05070d] sm:grid-cols-3 lg:grid-cols-8"
    >
      <div className="col-span-2 lg:col-span-2">
        <label className={label}>Motif</label>
        <input name="motif" defaultValue={motif} required className={champ} />
      </div>
      <div>
        <label className={label}>Catégorie</label>
        <input name="categorie" defaultValue={categorie} className={champ} />
      </div>
      <div>
        <label className={label}>Montant (FCFA)</label>
        <input name="montant" type="number" min={1} defaultValue={montant} required className={champ} />
      </div>
      <div>
        <label className={label}>Date</label>
        <input name="date" type="date" defaultValue={date.toISOString().slice(0, 10)} required className={champ} />
      </div>
      <div>
        <label className={label}>Personne</label>
        <input name="personne" defaultValue={personne} required className={champ} />
      </div>
      <div>
        <label className={label}>Source du fond</label>
        <input name="source" defaultValue={source} required className={champ} />
      </div>
      <div className="col-span-2 flex items-end gap-2 sm:col-span-1 lg:col-span-1">
        <button
          type="submit"
          className="shrink-0 rounded-full bg-[#14213D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#14213D]/85"
        >
          Enregistrer
        </button>
        <DeleteDepenseButton id={id} motif={motif} />
      </div>
      <div className="col-span-2 sm:col-span-3 lg:col-span-8">
        <label className={label}>Note (facultatif)</label>
        <input name="note" defaultValue={note ?? ""} className={champ} />
      </div>
    </form>
  );
}
