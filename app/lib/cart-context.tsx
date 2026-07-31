// ============================================================
//  PANIER — mémoire partagée (React Context) + sauvegarde navigateur
//  Client Component ("use client") car il gère de l'état interactif.
// ============================================================

"use client";

import { createContext, useContext, useEffect, useState } from "react";

// La forme d'un article dans le panier
// (une ligne = une variante précise : ex. "Basket rouge, taille 42")
export type CartItem = {
  productId: string;
  variantId: string;
  variantLabel: string | null; // ex: "Rouge / 42", null si produit simple
  slug: string;
  name: string;
  price: number; // en FCFA
  image: string | null;
  quantity: number;
  stock?: number; // stock connu au moment de l'ajout (facultatif)
};

// Ce que le panier met à disposition dans toute l'application
type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  count: number; // nombre total d'articles
  total: number; // prix total (FCFA)
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// Clé sous laquelle le panier est sauvegardé dans le navigateur
const STORAGE_KEY = "limak-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Au chargement : on relit le panier sauvegardé dans le navigateur.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ignore les paniers sauvegardés avant l'ajout des variantes
        // (articles sans variantId) : sans ça, le paiement plante en silence.
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((i): i is CartItem => !!i?.variantId));
        }
      }
    } catch {
      // panier illisible : on ignore
    }
    setLoaded(true);
  }, []);

  // À chaque changement du panier : on le sauvegarde dans le navigateur.
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  // Ajouter un article (s'il y est déjà, on augmente la quantité de 1,
  // sans jamais dépasser le stock connu).
  function addItem(item: Omit<CartItem, "quantity">) {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        const max = item.stock ?? existing.stock ?? Infinity;
        return prev.map((i) =>
          i.variantId === item.variantId
            ? {
                ...i,
                quantity: Math.min(i.quantity + 1, max),
                stock: item.stock ?? i.stock, // on rafraîchit le stock connu
              }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeItem(variantId: string) {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }

  // Modifier la quantité, sans jamais dépasser le stock connu de l'article.
  function updateQuantity(variantId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.variantId !== variantId) return i;
        const max = i.stock ?? Infinity;
        return { ...i, quantity: Math.min(quantity, max) };
      })
    );
  }

  function clear() {
    setItems([]);
  }

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, count, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Petit raccourci pour utiliser le panier dans n'importe quel composant.
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}