import { ScrollToShopButton } from "./ScrollToShopButton";

export function Hero() {
  return (
    <section className="hero">
      <video autoPlay loop muted playsInline>
        <source src="/videos/hero-loop.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-kicker">Strength In Proportion. Beauty In Resilience.</p>
        <h1>The New<br />Standard.</h1>
        <ScrollToShopButton className="btn">Explore The Collection</ScrollToShopButton>
      </div>
    </section>
  );
}
