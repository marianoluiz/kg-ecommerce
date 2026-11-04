import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { Product } from "@/data/products";

export const PRODUCTS_TAG = "products";

// Public catalog read, cached across requests. Uses a cookie-less client
// (cookies can't be read inside a cache scope). Invalidated by
// revalidateTag(PRODUCTS_TAG) when admins edit products or an order is paid;
// the 60s window is a safety net for stock changes made elsewhere.
export const getActiveProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, image_url, product_variants(size, stock)")
      .eq("is_active", true)
      .order("id");

    // Throw so a failed fetch is not cached as an empty catalog.
    if (error) throw new Error(`Could not load products: ${error.message}`);

    return (data ?? []).map((p) => ({
      id: String(p.id),
      name: p.name,
      price: Number(p.price),
      stockBySize: Object.fromEntries(p.product_variants.map((v) => [v.size, v.stock])),
      image: p.image_url,
      alt: p.name,
    }));
  },
  ["active-products"],
  { tags: [PRODUCTS_TAG], revalidate: 60 }
);
