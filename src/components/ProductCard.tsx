
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";
import { formatPeso } from "@/lib/format";
import { useCart } from "./CartProvider";

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
type Size = (typeof SIZES)[number];

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function openProduct() {
    setSelectedSize(null);
    setIsOpen(true);
  }

  function addSelectedProduct() {
    if (!selectedSize) return false;

    // Unique ID keeps each size separate in the cart.
    // Size is also displayed in the product name.
    const sizedProduct: Product = {
      ...product,
      id: `${product.id}-size-${selectedSize.toLowerCase()}`,
      name: `${product.name} (${selectedSize})`,
    };

    addItem(sizedProduct);
    return true;
  }

  function handleAddToCart() {
    if (addSelectedProduct()) {
      setIsOpen(false);
    }
  }

  function handleBuyNow() {
    if (addSelectedProduct()) {
      setIsOpen(false);
      router.push("/checkout");
    }
  }

  return (
    <>
      <div
        className="product-card"
        onClick={openProduct}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProduct();
          }
        }}
      >
        <div className="product-image-container">
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
          />

          <div className="add-to-cart">
            QUICK VIEW - {formatPeso(product.price)}
          </div>
        </div>

        <div className="product-info">
          <span className="product-name">{product.name}</span>
          <span className="product-price">
            {formatPeso(product.price)}
          </span>
        </div>
      </div>

      {isOpen &&
        createPortal(
          <div
            className="kg-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsOpen(false);
              }
            }}
          >
            <div
              className="kg-modal"
              role="dialog"
              aria-modal="true"
              aria-label={`Select size for ${product.name}`}
            >
              <button
                type="button"
                className="kg-modal-close"
                aria-label="Close"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>

              <div className="kg-modal-image">
                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  sizes="(max-width: 600px) 90vw, 320px"
                />
              </div>

              <div className="kg-modal-details">
                <span className="kg-brand">
                  KALLOS GORGON
                </span>

                <h2>{product.name}</h2>

                <p className="kg-price">
                  {formatPeso(product.price)}
                </p>

                <div className="kg-size-section">
                  <p>SELECT SIZE</p>

                  <div className="kg-sizes">
                    {SIZES.map((size) => (
                      <button
                        type="button"
                        key={size}
                        className={
                          selectedSize === size
                            ? "kg-size selected"
                            : "kg-size"
                        }
                        aria-pressed={selectedSize === size}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="kg-modal-actions">
                  <button
                    type="button"
                    className="kg-add-button"
                    disabled={!selectedSize}
                    onClick={handleAddToCart}
                  >
                    ADD TO CART
                  </button>

                  <button
                    type="button"
                    className="kg-buy-button"
                    disabled={!selectedSize}
                    onClick={handleBuyNow}
                  >
                    BUY NOW
                  </button>
                </div>

                {!selectedSize && (
                  <p className="kg-size-hint">
                    Select a size to continue
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
