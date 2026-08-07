// ============================================================
//  RECHERCHE — synonymes/termes proches du catalogue LIMAK
//  Ex: chercher "boubou" doit aussi trouver les tissus "bogolan".
//  Dictionnaire volontairement simple (pas d'IA) : facile à
//  compléter au fil du temps en ajoutant une ligne.
// ============================================================

const SYNONYMES: Record<string, string[]> = {
  // Habillement traditionnel / tissus
  boubou: ["bogolan", "pagne", "wax", "tissu africain"],
  bogolan: ["boubou", "pagne", "wax", "tissu africain", "fierté africaine"],
  pagne: ["bogolan", "boubou", "wax"],
  wax: ["bogolan", "boubou", "pagne"],
  "tissu africain": ["bogolan", "boubou", "pagne", "wax"],

  // Chaussures
  basket: ["sneaker", "sneakers", "tennis", "chaussure de sport"],
  baskets: ["sneaker", "sneakers", "tennis", "chaussure de sport"],
  sneaker: ["basket", "baskets", "tennis"],
  sneakers: ["basket", "baskets", "tennis"],
  tennis: ["basket", "baskets", "sneaker", "sneakers"],
  escarpin: ["talon", "talons"],
  talon: ["escarpin", "talons"],
  mule: ["mules", "sandale"],
  sandale: ["mule", "mules", "nu-pieds"],

  // Accessoires
  sac: ["sacoche", "pochette", "cabas", "sac à main"],
  sacoche: ["sac", "pochette"],
  pochette: ["sac", "sacoche"],
  montre: ["horloge"],
  lunette: ["lunettes", "solaire"],
  lunettes: ["lunette", "solaire"],
  bijou: ["bijoux", "collier", "bracelet", "boucle d'oreille"],
  bijoux: ["bijou", "collier", "bracelet", "boucle d'oreille"],

  // Beauté
  parfum: ["eau de toilette", "eau de parfum", "fragrance"],
  cosmetique: ["beaute", "soin", "maquillage"],
  cosmétique: ["beauté", "soin", "maquillage"],
  creme: ["crème", "soin", "hydratant"],

  // Électroménager / électronique
  frigo: ["réfrigérateur", "refrigerateur"],
  refrigerateur: ["frigo", "réfrigérateur"],
  climatiseur: ["climatisation", "clim"],
  clim: ["climatiseur", "climatisation"],
  telephone: ["téléphone", "smartphone", "portable"],
  téléphone: ["telephone", "smartphone", "portable"],

  // Maison
  deco: ["décoration", "décor", "decoration"],
  décoration: ["deco", "décor", "decoration"],
  rideau: ["rideaux", "voilage"],
};

// Enlève les accents pour matcher "decoration"/"décoration" indifféremment.
function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

// À partir d'une recherche utilisateur, renvoie la liste des termes à
// chercher (le mot d'origine + ses synonymes connus), sans doublons.
export function elargirRecherche(q: string): string[] {
  const termes = new Set<string>([q]);
  const mots = normaliser(q).split(/\s+/).filter(Boolean);

  for (const mot of mots) {
    const motNormalise = normaliser(mot);
    for (const [cle, synonymes] of Object.entries(SYNONYMES)) {
      if (normaliser(cle) === motNormalise) {
        synonymes.forEach((s) => termes.add(s));
      }
    }
  }

  return Array.from(termes);
}
