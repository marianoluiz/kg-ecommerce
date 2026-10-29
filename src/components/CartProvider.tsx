"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { Product } from "@/data/products";

type CartContextValue = {
  items: Product[];
  total: number;
  addItem: (product: Product) => void;
  clear: () => void;
  toast: { message: string; visible: boolean };
  showToast: (message: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [toast, setToast] = useState({ message: "", visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }, []);

  const addItem = useCallback(
    (product: Product) => {
      setItems((prev) => [...prev, product]);
      showToast(`${product.name} added.`);
    },
    [showToast],
  );

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, total: items.reduce((sum, p) => sum + p.price, 0), addItem, clear, toast, showToast }),
    [items, addItem, clear, toast, showToast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
