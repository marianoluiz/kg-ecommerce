
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/data/products";

export async function ProductGrid() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock, image_url, is_active")
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error.message);

    return (
      <section className="shop-section" id="shop">
        <div className="section-header">
          <h2>The Essentials</h2>
        </div>
        <p style={{ textAlign: "center", color: "#999" }}>
          Unable to load products.
        </p>
      </section>
    );
  }

  const products: Product[] = (data ?? []).map((item) => ({
    id: String(item.id),
    name: item.name,
    price: Number(item.price),
    image: item.image_url || "",
    alt: `${item.name} by Kallos Gorgon`,
    quadros: item.name === "Acid Knit Polo",
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
