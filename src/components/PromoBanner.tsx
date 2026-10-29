import Image from "next/image";
import { ScrollToShopButton } from "./ScrollToShopButton";

export function PromoBanner() {
  return (
    <section className="promo-banner">
      <Image src="/images/banners/quadros-technology-banner.avif" alt="Quadros Technology Fabric Integration" fill sizes="100vw" />
      <div className="promo-overlay" />
      <div className="promo-content">
        <h2>Quadros Technology™</h2>
        <p>A new chapter in functional apparel, where climate-engineered cotton and polyester matrices are given absolute priority.</p>
        <ScrollToShopButton className="discover-link">DISCOVER</ScrollToShopButton>
      </div>
    </section>
  );
}
