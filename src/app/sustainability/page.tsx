import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Sustainability | KALLOS GORGON" };

export default function SustainabilityPage() {
  return (
    <InfoPage
      kicker="Sustainability"
      title="Built To Last."
      intro="The most sustainable garment is the one you keep wearing. Our approach begins with durability."
      sections={[
        { heading: "Longevity First", body: <p>Quadros fabrics are engineered to hold their shape and colour over time, reducing the need for frequent replacement.</p> },
        { heading: "Considered Production", body: <p>We produce focused collections in measured quantities to limit overstock and waste.</p> },
        { heading: "Minimal Packaging", body: <p>Orders ship in simple, recyclable packaging without unnecessary inserts.</p> },
        { heading: "Care Guidance", body: <p>Wash cold, line dry in the shade and avoid high heat when ironing. Gentle care extends the life of every piece.</p> },
      ]}
    />
  );
}
