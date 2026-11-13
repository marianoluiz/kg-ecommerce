// Product data lives in the Supabase `products` table; this file only holds shared types.
export type Product = {
  id: string;
  name: string;
  price: number;
  /** Set (and below `price`) while the product is on sale. */
  salePrice?: number | null;
  description?: string | null;
  stockBySize: Partial<Record<Size, number>>;
  image: string;
  alt: string;
  quadros?: boolean;
};

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export const totalStock = (product: Pick<Product, "stockBySize">) =>
  Object.values(product.stockBySize).reduce((sum, n) => sum + (n ?? 0), 0);

/** Price actually charged: the sale price when one is set and lower, else the regular price. */
export const currentPrice = (product: Pick<Product, "price" | "salePrice">) =>
  product.salePrice != null && product.salePrice > 0 && product.salePrice < product.price
    ? product.salePrice
    : product.price;

export const isOnSale = (product: Pick<Product, "price" | "salePrice">) => currentPrice(product) < product.price;
