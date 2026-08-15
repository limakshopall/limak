// ============================================================
//  UNE LIGNE D'APPORT EXTÉRIEUR — modifiable directement
// ============================================================

import { updateApport } from "./actions";
import DeleteApportButton from "./DeleteApportButton";

const champ =
  "mt-1 w-full rounded border border-[#14213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#F1720A] focus:ring-1 focus:ring-[#F1720A] dark:border-white/15 dark:bg-[#05070d] dark:text-gray-300";
const label = "block text-xs text-neutral-500 dark:text-gray-400";

type Props = {
  id: string;
  montant: number;
  date: Date;
  personne: string;
  motif: string | null;
};

export default function ApportRow({ id, montant, date, personne, motif }: Props) {
  const updateAvecId = updateApport.bind(null, id);

  return (
    <form
      action={updateAvecId}
      className="grid grid-cols-2 items-end gap-2 rounded-lg border border-[#14213D]/10 bg-[#FFFBF3] p-3 shadow-sm dark:border-white/15 dark:bg-[#05070d] sm:grid-cols-5"
    >
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
        <label className={label}>Motif (facultatif)</label>
        <input name="motif" defaultValue={motif ?? ""} className={champ} />
      </div>
      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="shrink-0 rounded-full bg-[#14213D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#14213D]/85"
        >
          Enregistrer
        </button>
        <DeleteApportButton id={id} montant={montant} />
      </div>
    </form>
  );
}
