import Image from "next/image";
import Link from "next/link";

export function PromoBanner() {
  return (
    <section className="promo-banner">
      <Image src="/images/banners/quadros-technology-banner.avif" alt="Quadros Technology Fabric Integration" fill sizes="100vw" />
      <div className="promo-overlay" />
      <div className="promo-content">
        <h2>Quadros Technology™</h2>
        <p>A new chapter in functional apparel, where climate-engineered cotton and polyester matrices are given absolute priority.</p>
        <Link href="/quadros" className="discover-link">DISCOVER</Link>
      </div>
    </section>
  );
}
