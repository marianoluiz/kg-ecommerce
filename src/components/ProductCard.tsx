"use client";

import Image from "next/image";
import type { Product } from "@/data/products";
import { formatPeso } from "@/lib/format";
import { useCart } from "./CartProvider";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const price = formatPeso(product.price);

  return (
    <div className="product-card" onClick={() => addItem(product)}>
      <div className="product-image-container">
        <Image src={product.image} alt={product.alt} fill sizes="(max-width: 768px) 100vw, 25vw" />
        <div className="add-to-cart">Quick Add - {price}</div>
      </div>
      <div className="product-info">
        <span className="product-title">{product.name}{product.quadros && " (Quadros™)"}</span>
        <span className="product-price">{price}</span>
      </div>
    </div>
  );
}
