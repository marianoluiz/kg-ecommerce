import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "The Ethos | KALLOS GORGON" };

export default function EthosPage() {
  return (
    <InfoPage
      kicker="The Kallos Gorgon Ethos"
      title="Strength In Proportion."
      intro="Kallos Gorgon exists to end the compromise between refined design and the realities of the Philippine climate."
      sections={[
        { heading: "Kallos (κάλλος)", body: <p>Visual harmony and refined proportion. Every silhouette is cut to sit cleanly on the body, using restrained palettes and precise tailoring rather than ornament.</p> },
        { heading: "Gorgon (Γοργών)", body: <p>Resilience and bold physical presence. Our garments are built to hold their shape and composure through heat, humidity and long city days.</p> },
        { heading: "Designed For The Tropics", body: <p>We start from the climate, not the runway calendar. Breathability, moisture management and durability are design requirements, never afterthoughts.</p> },
        { heading: "Fewer, Better Pieces", body: <p>We release focused collections of versatile essentials intended to be worn often and kept for years.</p> },
      ]}
    />
  );
}
