import { BrandDetails } from "@/components/BrandDetails";
import { GroupSection } from "@/components/GroupSection";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { PromoBanner } from "@/components/PromoBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PromoBanner />
      <BrandDetails />
      <ProductGrid />
      <GroupSection />
    </>
  );
}
