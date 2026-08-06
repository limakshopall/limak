// ============================================================
//  ADBUILDER — modèles + sauvegarde locale (localStorage)
//  Pas de base de données : c'est un outil interne, chaque
//  navigateur garde ses propres projets.
// ============================================================

export type Layout = "vertical" | "overlay" | "split" | "texte-seul" | "badge-centre";
export type CouleurFond = "white" | "dore" | "bleu" | "orange";

export type Template = {
  id: string;
  nom: string;
  description: string; // affichée dans la galerie, pour se souvenir de l'usage du modèle
  layout: Layout;
  fondParDefaut: CouleurFond;
  titreDefaut: string;
  texteDefaut: string; // texte + appel à l'action, pré-rempli dans l'éditeur
};

// 15 modèles prêts à l'emploi pour les pubs LIMAK (Facebook/Insta/TikTok).
// Contenu par défaut modifiable dans l'éditeur — sert de point de départ.
export const TEMPLATES: Template[] = [
  {
    id: "flash-sale",
    nom: "Promo Flash Sale",
    description: "Urgence, grosse remise sur un article précis.",
    layout: "overlay",
    fondParDefaut: "orange",
    titreDefaut: "FLASH SALE 🔥",
    texteDefaut: "Jusqu'à -50% — Commander maintenant",
  },
  {
    id: "stock-limite",
    nom: "Stock Limité",
    description: "Pousser à l'achat avant rupture de stock.",
    layout: "vertical",
    fondParDefaut: "bleu",
    titreDefaut: "STOCK LIMITÉ ⚠️",
    texteDefaut: "Dernières pièces disponibles — Acheter avant rupture",
  },
  {
    id: "nouveau-produit",
    nom: "Nouveau Produit",
    description: "Présenter un article qui vient d'arriver.",
    layout: "split",
    fondParDefaut: "dore",
    titreDefaut: "NOUVEAU 🆕",
    texteDefaut: "Découvrez notre collection — Voir plus",
  },
  {
    id: "livraison-gratuite",
    nom: "Livraison Gratuite",
    description: "Mettre en avant l'offre de livraison, sans photo produit.",
    layout: "texte-seul",
    fondParDefaut: "white",
    titreDefaut: "LIVRAISON GRATUITE",
    texteDefaut: "Partout en Côte d'Ivoire — Commandes à partir de 30 000 FCFA",
  },
  {
    id: "paiement-livraison",
    nom: "Paiement à la Livraison",
    description: "Rassurer sur le mode de paiement, sans photo produit.",
    layout: "texte-seul",
    fondParDefaut: "bleu",
    titreDefaut: "PAIEMENT À LA LIVRAISON",
    texteDefaut: "Sans frais supplémentaires — Acheter en confiance",
  },
  {
    id: "avis-clients",
    nom: "Avis Clients",
    description: "Preuve sociale générale (pas un avis précis inventé).",
    layout: "badge-centre",
    fondParDefaut: "dore",
    titreDefaut: "SATISFAIT OU REMBOURSÉ",
    texteDefaut: "Nos clients nous font confiance — Voir les avis",
  },
  {
    id: "chaussures",
    nom: "Collection Chaussures",
    description: "Rayon chaussures — sans revendiquer l'authenticité d'une marque.",
    layout: "overlay",
    fondParDefaut: "bleu",
    titreDefaut: "CHAUSSURES",
    texteDefaut: "Sélection vérifiée par LIMAK — Découvrir",
  },
  {
    id: "accessoires",
    nom: "Collection Accessoires",
    description: "Rayon montres/lunettes/sacs.",
    layout: "split",
    fondParDefaut: "dore",
    titreDefaut: "ACCESSOIRES",
    texteDefaut: "Montres, lunettes, sacs — Explorer",
  },
  {
    id: "beaute",
    nom: "Collection Beauté",
    description: "Rayon beauté/soins.",
    layout: "vertical",
    fondParDefaut: "white",
    titreDefaut: "BEAUTÉ & SOINS",
    texteDefaut: "Sérums, huiles, cosmétiques — Parcourir",
  },
  {
    id: "bogolan",
    nom: "Bogolan Traditionnel",
    description: "Rayon accessoires traditionnels.",
    layout: "overlay",
    fondParDefaut: "bleu",
    titreDefaut: "FIERTÉ AFRICAINE",
    texteDefaut: "Tissus bogolan authentiques — Commander",
  },
  {
    id: "montre-elegante",
    nom: "Montre Élégante",
    description: "Mettre en avant une montre précise.",
    layout: "badge-centre",
    fondParDefaut: "dore",
    titreDefaut: "MONTRE ÉLÉGANCE",
    texteDefaut: "Boîtier doré, luxe abordable — Voir la collection",
  },
  {
    id: "soldes",
    nom: "Soldes du Mois",
    description: "Remise générale sur le catalogue (change le mois toi-même).",
    layout: "overlay",
    fondParDefaut: "orange",
    titreDefaut: "SOLDES DU MOIS",
    texteDefaut: "Jusqu'à -40% sur tout — Profiter maintenant",
  },
  {
    id: "qualite-verifiee",
    nom: "Qualité Vérifiée",
    description: "Réassurance qualité — sans certificat ni promesse d'authenticité inventée.",
    layout: "texte-seul",
    fondParDefaut: "bleu",
    titreDefaut: "QUALITÉ VÉRIFIÉE LIMAK",
    texteDefaut: "Chaque article est contrôlé avant envoi — Acheter en confiance",
  },
  {
    id: "satisfaction",
    nom: "Satisfaction Clients",
    description: "Remerciement / fidélisation, sans photo produit.",
    layout: "texte-seul",
    fondParDefaut: "dore",
    titreDefaut: "MERCI À NOS CLIENTS !",
    texteDefaut: "Votre satisfaction est notre priorité — Nous contacter",
  },
  {
    id: "nouvelle-collection",
    nom: "Nouvelle Collection",
    description: "Annoncer un arrivage de la semaine.",
    layout: "vertical",
    fondParDefaut: "white",
    titreDefaut: "NOUVELLE COLLECTION",
    texteDefaut: "Arrivages de la semaine — Découvrir",
  },
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
