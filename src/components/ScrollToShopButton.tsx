"use client";

import type { ReactNode } from "react";

export function ScrollToShopButton({ className, children }: { className: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}>
      {children}
    </button>
  );
}
