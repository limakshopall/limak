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
  name: string;
  price: number;
  comparePrice: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  stock: number;
  note?: Note;
};

type Img = { url: string; alt: string | null; width: number | null; height: number | null };
type ColorForDisplay = { id: string; name: string; images: Img[] };
type VariantForDisplay = { colorId: string | null; price: number; comparePrice: number | null; stock: number };

export type ProductForDisplay = {
  id: string;
  slug: string;
  name: string;
  images: Img[];
  colors: ColorForDisplay[];
  variants: VariantForDisplay[];
};

export function toDisplayItems(product: ProductForDisplay, note?: Note): DisplayItem[] {
  if (product.colors.length === 0) {
    const cheapest = [...product.variants].sort((a, b) => a.price - b.price)[0];
    const stock = product.variants.reduce((s, v) => s + v.stock, 0);
    const image = product.images[0];
    return [
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: cheapest?.price ?? 0,
        comparePrice: cheapest?.comparePrice ?? null,
        imageUrl: image?.url ?? null,
        imageAlt: image?.alt ?? null,
        imageWidth: image?.width ?? null,
        imageHeight: image?.height ?? null,
        stock,
        note,
      },
    ];
  }

  return product.colors.map((c) => {
    const variantsForColor = product.variants.filter((v) => v.colorId === c.id);
    const cheapest = [...variantsForColor].sort((a, b) => a.price - b.price)[0];
    const stock = variantsForColor.reduce((s, v) => s + v.stock, 0);
    const image = c.images[0] ?? product.images[0];
    return {
      id: `${product.id}:${c.id}`,
      slug: product.slug,
      name: `${product.name} — ${c.name}`,
      price: cheapest?.price ?? 0,
      comparePrice: cheapest?.comparePrice ?? null,
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? null,
      imageWidth: image?.width ?? null,
      imageHeight: image?.height ?? null,
      stock,
      note,
    };
  });
}
