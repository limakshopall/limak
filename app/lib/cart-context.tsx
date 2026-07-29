// ============================================================
//  PANIER — mémoire partagée (React Context) + sauvegarde navigateur
//  Client Component ("use client") car il gère de l'état interactif.
// ============================================================

"use client";

import { createContext, useContext, useEffect, useState } from "react";

// La forme d'un article dans le panier
export type CartItem = {
  productId: string;
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
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
      if (saved) setItems(JSON.parse(saved));
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
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        const max = item.stock ?? existing.stock ?? Infinity;
        return prev.map((i) =>
          i.productId === item.productId
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

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  // Modifier la quantité, sans jamais dépasser le stock connu de l'article.
  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
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