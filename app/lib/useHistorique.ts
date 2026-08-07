// ============================================================
//  ADBUILDER — historique annuler/refaire (10 dernières étapes)
// ============================================================

"use client";

import { useState } from "react";

const LIMITE_HISTORIQUE = 10;

export function useHistorique<T>(etatInitial: T) {
  const [historique, setHistorique] = useState<T[]>([etatInitial]);
  const [position, setPosition] = useState(0);

  // Change l'état ET l'ajoute à l'historique (à appeler pour chaque
  // modification "significative" : texte validé, couleur, police...).
  function setEtat(nouvelEtat: T) {
    // On coupe le "futur" si on modifie après avoir fait des Annuler.
    let suivant = [...historique.slice(0, position + 1), nouvelEtat];
    if (suivant.length > LIMITE_HISTORIQUE) {
      suivant = suivant.slice(suivant.length - LIMITE_HISTORIQUE);
    }
    setHistorique(suivant);
    setPosition(suivant.length - 1);
  }

  // Met à jour l'affichage sans créer d'étape d'historique — utilisé pendant
  // la frappe au clavier (sinon chaque lettre tapée créerait une étape).
  // Appeler `setEtat` ensuite (ex: au blur du champ) pour valider l'étape.
  function setEtatLive(nouvelEtat: T) {
    setHistorique((h) => h.map((v, i) => (i === position ? nouvelEtat : v)));
  }

  function annuler() {
    if (position === 0) return;
    setPosition(position - 1);
  }

  function refaire() {
    if (position >= historique.length - 1) return;
    setPosition(position + 1);
  }

  return {
    etat: historique[position],
    setEtat,
    setEtatLive,
    annuler,
    refaire,
    peutAnnuler: position > 0,
    peutRefaire: position < historique.length - 1,
  };
}
