// ============================================================
//  useHydrated — vrai seulement une fois le composant monté côté client.
//  Via useSyncExternalStore (pas useEffect+setState) pour rester
//  conforme à la règle ESLint react-hooks/set-state-in-effect :
//  le "mismatch" serveur/client est résolu par React lui-même,
//  pas par un setState synchrone dans un effet.
// ============================================================

"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
