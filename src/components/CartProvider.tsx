"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Product, Size } from "@/data/products";

export type CartItem = {
  productId: string;
  name: string;
  size: Size;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (product: Product, size: Size) => void;
  setQuantity: (productId: string, size: Size, quantity: number) => void;
  removeItem: (productId: string, size: Size) => void;
  clear: () => void;
  toast: { message: string; visible: boolean };
  showToast: (message: string) => void;
};

const STORAGE_KEY = "kg-cart";
const MAX_QTY = 10;

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Restore cart after mount so server and client render the same markup.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) setItems(saved);
    } catch {
      // Ignore corrupt storage.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const showToast = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }, []);

  const addItem = useCallback(
    (product: Product, size: Size) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id && i.size === size);
        if (existing) {
          return prev.map((i) =>
            i === existing ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QTY) } : i
          );
        }
        return [
          ...prev,
          { productId: product.id, name: product.name, size, price: product.price, image: product.image, quantity: 1 },
        ];
      });
      showToast(`${product.name} (${size}) added.`);
    },
    [showToast],
  );

  const setQuantity = useCallback((productId: string, size: Size, quantity: number) => {
    setItems((prev) =>
      quantity < 1
        ? prev.filter((i) => !(i.productId === productId && i.size === size))
        : prev.map((i) =>
            i.productId === productId && i.size === size ? { ...i, quantity: Math.min(quantity, MAX_QTY) } : i
          )
    );
  }, []);

  const removeItem = useCallback((productId: string, size: Size) => setQuantity(productId, size, 0), [setQuantity]);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clear,
      toast,
      showToast,
    }),
    [items, addItem, setQuantity, removeItem, clear, toast, showToast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
