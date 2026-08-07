// ============================================================
//  ADBUILDER — modèles + sauvegarde locale (localStorage)
//  Pas de base de données : c'est un outil interne, chaque
//  navigateur garde ses propres projets.
// ============================================================

export type Layout = "vertical" | "overlay" | "split" | "texte-seul" | "badge-centre";
export type Police = "Arial" | "Playfair Display" | "Montserrat";
export type TailleTexte = "petit" | "moyen" | "grand";

// Couleurs libres (code hex) — les 4 couleurs LIMAK ci-dessous ne sont que des
// raccourcis proposés dans l'éditeur, on peut choisir n'importe quelle couleur.
export const PALETTE_LIMAK = {
  dore: "#C9A84C",
  bleu: "#14213D",
  sable: "#FBEEDA",
  orange: "#F1720A",
} as const;

export type Template = {
  id: string;
  nom: string;
  description: string; // affichée dans la galerie, pour se souvenir de l'usage du modèle
  layout: Layout;
  fondParDefaut: string; // hex
  titreDefaut: string;
  texteDefaut: string;
  ctaDefaut: string;
};

// 15 modèles prêts à l'emploi pour les pubs LIMAK (Facebook/Insta/TikTok).
// Contenu par défaut modifiable dans l'éditeur — sert de point de départ.
export const TEMPLATES: Template[] = [
  {
    id: "flash-sale",
    nom: "Promo Flash Sale",
    description: "Urgence, grosse remise sur un article précis.",
    layout: "overlay",
    fondParDefaut: PALETTE_LIMAK.orange,
    titreDefaut: "FLASH SALE 🔥",
    texteDefaut: "Jusqu'à -50%",
    ctaDefaut: "Commander maintenant",
  },
  {
    id: "stock-limite",
    nom: "Stock Limité",
    description: "Pousser à l'achat avant rupture de stock.",
    layout: "vertical",
    fondParDefaut: PALETTE_LIMAK.bleu,
    titreDefaut: "STOCK LIMITÉ ⚠️",
    texteDefaut: "Dernières pièces disponibles",
    ctaDefaut: "Acheter avant rupture",
  },
  {
    id: "nouveau-produit",
    nom: "Nouveau Produit",
    description: "Présenter un article qui vient d'arriver.",
    layout: "split",
    fondParDefaut: PALETTE_LIMAK.dore,
    titreDefaut: "NOUVEAU 🆕",
    texteDefaut: "Découvrez notre collection",
    ctaDefaut: "Voir plus",
  },
  {
    id: "livraison-gratuite",
    nom: "Livraison Gratuite",
    description: "Mettre en avant l'offre de livraison, sans photo produit.",
    layout: "texte-seul",
    fondParDefaut: PALETTE_LIMAK.sable,
    titreDefaut: "LIVRAISON GRATUITE",
    texteDefaut: "Partout en Côte d'Ivoire, dès 30 000 FCFA",
    ctaDefaut: "Commander",
  },
  {
    id: "paiement-livraison",
    nom: "Paiement à la Livraison",
    description: "Rassurer sur le mode de paiement, sans photo produit.",
    layout: "texte-seul",
    fondParDefaut: PALETTE_LIMAK.bleu,
    titreDefaut: "PAIEMENT À LA LIVRAISON",
    texteDefaut: "Sans frais supplémentaires",
    ctaDefaut: "Acheter en confiance",
  },
  {
    id: "avis-clients",
    nom: "Avis Clients",
    description: "Preuve sociale générale (pas un avis précis inventé).",
    layout: "badge-centre",
    fondParDefaut: PALETTE_LIMAK.dore,
    titreDefaut: "SATISFAIT OU REMBOURSÉ",
    texteDefaut: "Nos clients nous font confiance",
    ctaDefaut: "Voir les avis",
  },
  {
    id: "chaussures",
    nom: "Collection Chaussures",
    description: "Rayon chaussures — sans revendiquer l'authenticité d'une marque.",
    layout: "overlay",
    fondParDefaut: PALETTE_LIMAK.bleu,
    titreDefaut: "CHAUSSURES",
    texteDefaut: "Sélection vérifiée par LIMAK",
    ctaDefaut: "Découvrir",
  },
  {
    id: "accessoires",
    nom: "Collection Accessoires",
    description: "Rayon montres/lunettes/sacs.",
    layout: "split",
    fondParDefaut: PALETTE_LIMAK.dore,
    titreDefaut: "ACCESSOIRES",
    texteDefaut: "Montres, lunettes, sacs",
    ctaDefaut: "Explorer",
  },
  {
    id: "beaute",
    nom: "Collection Beauté",
    description: "Rayon beauté/soins.",
    layout: "vertical",
    fondParDefaut: PALETTE_LIMAK.sable,
    titreDefaut: "BEAUTÉ & SOINS",
    texteDefaut: "Sérums, huiles, cosmétiques",
    ctaDefaut: "Parcourir",
  },
  {
    id: "bogolan",
    nom: "Bogolan Traditionnel",
    description: "Rayon accessoires traditionnels.",
    layout: "overlay",
    fondParDefaut: PALETTE_LIMAK.bleu,
    titreDefaut: "FIERTÉ AFRICAINE",
    texteDefaut: "Tissus bogolan authentiques",
    ctaDefaut: "Commander",
  },
  {
    id: "montre-elegante",
    nom: "Montre Élégante",
    description: "Mettre en avant une montre précise.",
    layout: "badge-centre",
    fondParDefaut: PALETTE_LIMAK.dore,
    titreDefaut: "MONTRE ÉLÉGANCE",
    texteDefaut: "Boîtier doré, luxe abordable",
    ctaDefaut: "Voir la collection",
  },
  {
    id: "soldes",
    nom: "Soldes du Mois",
    description: "Remise générale sur le catalogue (change le mois toi-même).",
    layout: "overlay",
    fondParDefaut: PALETTE_LIMAK.orange,
    titreDefaut: "SOLDES DU MOIS",
    texteDefaut: "Jusqu'à -40% sur tout",
    ctaDefaut: "Profiter maintenant",
  },
  {
    id: "qualite-verifiee",
    nom: "Qualité Vérifiée",
    description: "Réassurance qualité — sans certificat ni promesse d'authenticité inventée.",
    layout: "texte-seul",
    fondParDefaut: PALETTE_LIMAK.bleu,
    titreDefaut: "QUALITÉ VÉRIFIÉE LIMAK",
    texteDefaut: "Chaque article est contrôlé avant envoi",
    ctaDefaut: "Acheter en confiance",
  },
  {
    id: "satisfaction",
    nom: "Satisfaction Clients",
    description: "Remerciement / fidélisation, sans photo produit.",
    layout: "texte-seul",
    fondParDefaut: PALETTE_LIMAK.dore,
    titreDefaut: "MERCI À NOS CLIENTS !",
    texteDefaut: "Votre satisfaction est notre priorité",
    ctaDefaut: "Nous contacter",
  },
  {
    id: "nouvelle-collection",
    nom: "Nouvelle Collection",
    description: "Annoncer un arrivage de la semaine.",
    layout: "vertical",
    fondParDefaut: PALETTE_LIMAK.sable,
    titreDefaut: "NOUVELLE COLLECTION",
    texteDefaut: "Arrivages de la semaine",
    ctaDefaut: "Découvrir",
  },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

// Formats d'export — chaque format pilote à la fois l'aperçu ET le fichier
// téléchargé (ce que tu vois est ce que tu télécharges).
export type Format = { id: string; nom: string; w: number; h: number };
export const FORMATS: Format[] = [
  { id: "facebook", nom: "Facebook (1200×628)", w: 1200, h: 628 },
  { id: "ig-post", nom: "Instagram Post (1080×1080)", w: 1080, h: 1080 },
  { id: "ig-story", nom: "Instagram Story (1080×1920)", w: 1080, h: 1920 },
  { id: "tiktok", nom: "TikTok (1080×1920)", w: 1080, h: 1920 },
];
export function getFormat(id: string): Format {
  return FORMATS.find((f) => f.id === id) ?? FORMATS[2];
}

export type Projet = {
  id: string;
  nom: string;
  templateId: string;
  formatId: string;
  titre: string;
  description: string;
  cta: string;
  fond: string;
  couleurTexte: string;
  couleurCTA: string;
  police: Police;
  tailleTexte: TailleTexte;
  imageDataUrl: string | null;
  // Position/taille personnalisées (glisser-déposer) par élément, en fractions
  // (0-1) du format — optionnel pour rester compatible avec les anciens projets.
  boitesPerso?: Partial<Record<"image" | "titre" | "desc" | "cta", { x: number; y: number; w: number; h?: number }>>;
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
