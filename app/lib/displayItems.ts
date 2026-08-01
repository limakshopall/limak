// ============================================================
//  Éclate un produit en plusieurs "cartes affichées" — une par
//  couleur si le produit en a, sinon une seule pour le produit.
//  But : donner de la densité au catalogue (chaque couleur visible
//  directement dans les listes), tout en gardant une seule fiche
//  produit (avec le sélecteur complet) derrière chaque carte.
// ============================================================

export type Note = { moyenne: number; nb: number };

export type DisplayItem = {
  id: string;
  slug: string;
  colorId: string | null;
  name: string;
  price: number;
  comparePrice: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  imageUrlHover: string | null; // 2e photo, pour l'effet de survol
  stock: number;
  isNew: boolean;
  note?: Note;
};

type Img = { url: string; alt: string | null; width: number | null; height: number | null };
type ColorForDisplay = { id: string; name: string; images: Img[] };
type VariantForDisplay = { colorId: string | null; price: number; comparePrice: number | null; stock: number };

export type ProductForDisplay = {
  id: string;
  slug: string;
  name: string;
  createdAt: Date;
  images: Img[];
  colors: ColorForDisplay[];
  variants: VariantForDisplay[];
};

// Un produit est "nouveau" s'il a été ajouté il y a moins de 14 jours.
const NOUVEAU_JOURS = 14;

function estNouveau(createdAt: Date): boolean {
  const age = Date.now() - createdAt.getTime();
  return age <= NOUVEAU_JOURS * 24 * 60 * 60 * 1000;
}

export function toDisplayItems(product: ProductForDisplay, note?: Note): DisplayItem[] {
  const isNew = estNouveau(product.createdAt);

  if (product.colors.length === 0) {
    const cheapest = [...product.variants].sort((a, b) => a.price - b.price)[0];
    const stock = product.variants.reduce((s, v) => s + v.stock, 0);
    const [image, imageHover] = product.images;
    return [
      {
        id: product.id,
        slug: product.slug,
        colorId: null,
        name: product.name,
        price: cheapest?.price ?? 0,
        comparePrice: cheapest?.comparePrice ?? null,
        imageUrl: image?.url ?? null,
        imageAlt: image?.alt ?? null,
        imageWidth: image?.width ?? null,
        imageHeight: image?.height ?? null,
        imageUrlHover: imageHover?.url ?? null,
        stock,
        isNew,
        note,
      },
    ];
  }

  return product.colors.map((c) => {
    const variantsForColor = product.variants.filter((v) => v.colorId === c.id);
    const cheapest = [...variantsForColor].sort((a, b) => a.price - b.price)[0];
    const stock = variantsForColor.reduce((s, v) => s + v.stock, 0);
    const images = c.images.length > 0 ? c.images : product.images;
    const [image, imageHover] = images;
    return {
      id: `${product.id}:${c.id}`,
      slug: product.slug,
      colorId: c.id,
      name: `${product.name} — ${c.name}`,
      price: cheapest?.price ?? 0,
      comparePrice: cheapest?.comparePrice ?? null,
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? null,
      imageWidth: image?.width ?? null,
      imageHeight: image?.height ?? null,
      imageUrlHover: imageHover?.url ?? null,
      stock,
      isNew,
      note,
    };
  });
}

// Les articles épuisés passent en fin de liste (tri stable : l'ordre
// d'origine — prix, nouveauté… — est conservé au sein de chaque groupe).
export function epuisesEnDernier(items: DisplayItem[]): DisplayItem[] {
  return [...items].sort((a, b) => Number(a.stock <= 0) - Number(b.stock <= 0));
}
