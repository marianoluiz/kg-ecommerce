"use client";

import { useCart } from "./CartProvider";

export function Toast() {
  const { toast } = useCart();
  return (
    <div className={`toast${toast.visible ? " toast-visible" : ""}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}
