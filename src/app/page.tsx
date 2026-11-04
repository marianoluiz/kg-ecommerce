import { Suspense } from "react";
import { BrandDetails } from "@/components/BrandDetails";
import { GroupSection } from "@/components/GroupSection";
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
      <Suspense fallback={<ProductGridSkeleton />}>
        <Products />
      </Suspense>
      <BrandDetails />
      <PromoBanner />
      <GroupSection />
    </>
  );
}
