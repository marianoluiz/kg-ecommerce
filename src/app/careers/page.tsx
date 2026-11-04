import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Careers | KALLOS GORGON" };

export default function CareersPage() {
  return (
    <InfoPage
      kicker="Careers"
      title="Join The Atelier."
      intro="We are a small team building climate-engineered fashion for the Philippine tropics. There are no open roles at the moment, but we are always glad to hear from talented people."
      sections={[
        { heading: "Design & Product", body: <p>Fashion designers, pattern makers and textile specialists who care about fit, fabric and function.</p> },
        { heading: "Technology", body: <p>Developers and designers who want to craft a refined digital storefront experience.</p> },
        { heading: "Operations", body: <p>Logistics, customer care and retail partners who keep every order running smoothly.</p> },
        { heading: "Stay In Touch", body: <p>Subscribe to our newsletter in the footer to hear first when a matching role opens.</p> },
      ]}
      cta={{ href: "/#about", label: "Meet Group 5" }}
    />
  );
}
