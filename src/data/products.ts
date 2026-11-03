// Product data lives in the Supabase `products` table; this file only holds shared types.
export type Product = {
  id: string;
  name: string;
  price: number;
  stockBySize: Partial<Record<Size, number>>;
  image: string;
  alt: string;
  quadros?: boolean;
};

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export const totalStock = (product: Pick<Product, "stockBySize">) =>
  Object.values(product.stockBySize).reduce((sum, n) => sum + (n ?? 0), 0);
