// ============================================================
//  ADBUILDER — modèles + sauvegarde locale (localStorage)
//  Pas de base de données : c'est un outil interne, chaque
//  navigateur garde ses propres projets.
// ============================================================

export type Layout = "vertical" | "overlay" | "split" | "texte-seul" | "badge-centre";
export type CouleurFond = "white" | "dore" | "bleu";

export type Template = {
  id: string;
  nom: string;
  description: string;
  layout: Layout;
  fondParDefaut: CouleurFond;
};

// 15 modèles de base — combinaisons de mise en page x couleur d'accent.
// MVP : pas de vraies miniatures, juste un aperçu de couleur + nom explicite.
export const TEMPLATES: Template[] = [
  { id: "vertical-dore", nom: "Vertical Doré", description: "Photo en haut, texte en bas, accent doré.", layout: "vertical", fondParDefaut: "dore" },
  { id: "vertical-bleu", nom: "Vertical Bleu Nuit", description: "Photo en haut, texte en bas, accent bleu nuit.", layout: "vertical", fondParDefaut: "bleu" },
  { id: "vertical-blanc", nom: "Vertical Sobre", description: "Photo en haut, texte en bas, fond blanc épuré.", layout: "vertical", fondParDefaut: "white" },
  { id: "overlay-dore", nom: "Plein Écran Doré", description: "Photo plein cadre, texte superposé, bandeau doré.", layout: "overlay", fondParDefaut: "dore" },
  { id: "overlay-bleu", nom: "Plein Écran Bleu", description: "Photo plein cadre, texte superposé, bandeau bleu nuit.", layout: "overlay", fondParDefaut: "bleu" },
  { id: "overlay-blanc", nom: "Plein Écran Clair", description: "Photo plein cadre, texte superposé sur fond clair.", layout: "overlay", fondParDefaut: "white" },
  { id: "split-dore", nom: "Découpé Doré", description: "Photo à gauche, texte à droite sur fond doré.", layout: "split", fondParDefaut: "dore" },
  { id: "split-bleu", nom: "Découpé Bleu", description: "Photo à gauche, texte à droite sur fond bleu nuit.", layout: "split", fondParDefaut: "bleu" },
  { id: "split-blanc", nom: "Découpé Sobre", description: "Photo à gauche, texte à droite sur fond blanc.", layout: "split", fondParDefaut: "white" },
  { id: "texte-dore", nom: "Grand Texte Doré", description: "Pas de photo, gros texte accrocheur sur fond doré.", layout: "texte-seul", fondParDefaut: "dore" },
  { id: "texte-bleu", nom: "Grand Texte Bleu", description: "Pas de photo, gros texte accrocheur sur fond bleu nuit.", layout: "texte-seul", fondParDefaut: "bleu" },
  { id: "texte-blanc", nom: "Grand Texte Sobre", description: "Pas de photo, gros texte accrocheur sur fond blanc.", layout: "texte-seul", fondParDefaut: "white" },
  { id: "badge-dore", nom: "Badge Central Doré", description: "Photo centrée dans un cadre, texte autour, fond doré.", layout: "badge-centre", fondParDefaut: "dore" },
  { id: "badge-bleu", nom: "Badge Central Bleu", description: "Photo centrée dans un cadre, texte autour, fond bleu nuit.", layout: "badge-centre", fondParDefaut: "bleu" },
  { id: "badge-blanc", nom: "Badge Central Sobre", description: "Photo centrée dans un cadre, texte autour, fond blanc.", layout: "badge-centre", fondParDefaut: "white" },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export type Projet = {
  id: string;
  templateId: string;
  titre: string;
  description: string;
  fond: CouleurFond;
  imageDataUrl: string | null;
  creeLe: number;
};

const CLE_STOCKAGE = "limak-adbuilder-projets";

export function listerProjets(): Projet[] {
  if (typeof window === "undefined") return [];
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE);
    return brut ? (JSON.parse(brut) as Projet[]) : [];
  } catch {
    return [];
  }
}

export function sauvegarderProjet(projet: Projet): void {
  if (typeof window === "undefined") return;
  const projets = listerProjets().filter((p) => p.id !== projet.id);
  projets.unshift(projet);
  window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(projets));
}

export function supprimerProjet(id: string): void {
  if (typeof window === "undefined") return;
  const projets = listerProjets().filter((p) => p.id !== id);
  window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(projets));
}
