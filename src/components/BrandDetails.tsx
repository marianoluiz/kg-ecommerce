import Image from "next/image";

export function BrandDetails() {
  return (
    <section className="details-section">
      <Image src="/images/banners/runway-presentation.avif" alt="Kallos Gorgon Runway Presentation" fill sizes="100vw" />
      <div className="details-overlay" />
      <div className="details-text">
        <h2>The Etymology of Utility</h2>
        <p>
          Conceptualized for the Philippine climate, Kallos Gorgon draws its foundation from classical Greek etymology:{" "}
          <strong>Kallos (κάλλος)</strong>, denoting visual harmony and refined proportion, and <strong>Gorgon (Γοργών)</strong>, symbolizing resilience and bold physical presence.
        </p>
        <p>
          Powered by <strong>Quadros Technology™</strong>, our garments utilize a precise cotton-polyester matrix to optimize thermoregulation, maximize airflow, and maintain structural integrity against tropical moisture, eliminating the compromise between aesthetic sophistication and functional performance.
        </p>
      </div>
    </section>
  );
}
