
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SIZES, currentPrice, isOnSale, totalStock, type Product, type Size } from "@/data/products";
import { formatPeso } from "@/lib/format";
import { useCart } from "./CartProvider";

// Regular price struck through, sale price next to it. Plain price when not on sale.
function PriceTag({ product }: { product: Product }) {
  if (!isOnSale(product)) return <>{formatPeso(product.price)}</>;
  return (
    <>
      <s className="price-old">{formatPeso(product.price)}</s>{" "}
      <span className="price-sale">{formatPeso(currentPrice(product))}</span>
    </>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const total = totalStock(product);
  const soldOut = total <= 0;
  const stockLabel = soldOut ? "Out of stock" : `${total} in stock`;
  const sizeStock = (size: Size) => product.stockBySize[size] ?? 0;
  const modalStockLabel = selectedSize
    ? sizeStock(selectedSize) > 0
      ? `Size ${selectedSize}: ${sizeStock(selectedSize)} in stock`
      : `Size ${selectedSize}: Out of stock`
    : stockLabel;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  function openProduct() {
    setSelectedSize(null);
    setIsOpen(true);
  }

  function addSelectedProduct() {
    if (!selectedSize) return false;

    addItem(product, selectedSize);
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
            QUICK VIEW - {formatPeso(currentPrice(product))}
          </div>
        </div>

        <div className="product-info">
          <span className="product-name">{product.name}</span>
          <span className="product-price">
            <PriceTag product={product} />
          </span>
          <span className="product-stock">{stockLabel}</span>
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
                  sizes="(max-width: 700px) 90vw, 650px"
                />
              </div>

              <div className="kg-modal-details">
                <span className="kg-brand">KALLOS GORGON</span>

                <h2>{product.name}</h2>

                <p className="kg-price">
                  <PriceTag product={product} />
                </p>

                <p className="kg-stock">{modalStockLabel}</p>

                {product.description && <p className="kg-description">{product.description}</p>}

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
                        disabled={sizeStock(size) <= 0}
                        title={sizeStock(size) <= 0 ? "Out of stock" : `${sizeStock(size)} in stock`}
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
                    disabled={!selectedSize || soldOut}
                    onClick={handleAddToCart}
                  >
                    ADD TO CART
                  </button>

                  <button
                    type="button"
                    className="kg-buy-button"
                    disabled={!selectedSize || soldOut}
                    onClick={handleBuyNow}
                  >
                    BUY NOW
                  </button>
                </div>

                {!selectedSize && !soldOut && (
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
