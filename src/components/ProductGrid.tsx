import { products } from "@/data/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid() {
  return (
    <section className="shop-section" id="shop">
      <div className="section-header">
        <h2>The Essentials</h2>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
