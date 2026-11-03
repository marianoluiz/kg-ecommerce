import { BrandDetails } from "@/components/BrandDetails";
import { GroupSection } from "@/components/GroupSection";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { PromoBanner } from "@/components/PromoBanner";
import type { Product } from "@/data/products";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, image_url, product_variants(size, stock)")
    .eq("is_active", true)
    .order("id");

  if (error) console.error(error);

  const products: Product[] = (data ?? []).map((p) => ({
    id: String(p.id),
    name: p.name,
    price: Number(p.price),
    stockBySize: Object.fromEntries(p.product_variants.map((v) => [v.size, v.stock])),
    image: p.image_url,
    alt: p.name,
  }));

  return (
    <>
      <Hero />
      <PromoBanner />
      <BrandDetails />
      <ProductGrid products={products} />
      <GroupSection />
    </>
  );
}