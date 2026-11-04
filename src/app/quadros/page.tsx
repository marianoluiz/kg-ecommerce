import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Quadros Technology™ | KALLOS GORGON" };

export default function QuadrosPage() {
  return (
    <InfoPage
      kicker="Fabric Innovation"
      title="Quadros Technology™"
      intro="A new chapter in functional apparel, where climate-engineered cotton and polyester matrices are given absolute priority."
      sections={[
        { heading: "The Matrix", body: <p>Quadros pairs natural cotton fibres for softness and comfort with engineered polyester for strength and quick drying, balanced in a precise blend for tropical wear.</p> },
        { heading: "Thermoregulation", body: <p>An open weave structure promotes airflow across the body, helping release heat during humid afternoons and commutes.</p> },
        { heading: "Moisture Management", body: <p>The polyester component wicks moisture away from the skin and dries faster than pure cotton, reducing cling and keeping the garment&apos;s line clean.</p> },
        { heading: "Structural Integrity", body: <p>Quadros fabrics resist stretching, sagging and shrinking through repeated wear and washing, so each piece keeps its proportion.</p> },
      ]}
    />
  );
}
