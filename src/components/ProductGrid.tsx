import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/data/products";

export async function ProductGrid() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock, image_url")
    .eq("is_active", true)
    .order("id");

  if (error) {
    console.error("Product loading error:", error.message);
    return <p>Unable to load products.</p>;
  }

  const products: Product[] = (data ?? []).map((item) => ({
    id: String(item.id),
    name: item.name,
    price: Number(item.price),
    image: item.image_url || "/images/products/acid-knit-polo.avif",
    alt: item.name,
  }));

  return (
    <section className="shop-section" id="shop">
      <div className="section-header">
        <h2>The Essentials</h2>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}
