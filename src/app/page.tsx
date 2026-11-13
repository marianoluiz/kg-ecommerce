import { Suspense } from "react";
import { BrandDetails } from "@/components/BrandDetails";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { PromoBanner } from "@/components/PromoBanner";
import { getActiveProducts } from "@/lib/products";

async function Products() {
  try {
    return <ProductGrid products={await getActiveProducts()} />;
  } catch (error) {
    console.error(error);
    return <ProductGrid products={[]} />;
  }
}

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* The hero renders immediately; products stream in behind a skeleton. */}
      <div id="shop" className="shop-anchor">
        <Suspense fallback={<ProductGridSkeleton />}>
          <Products />
        </Suspense>
      </div>
      <BrandDetails />
      <PromoBanner />
    </>
  );
}
