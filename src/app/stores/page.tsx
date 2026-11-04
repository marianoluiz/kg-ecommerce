import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Store Locator | KALLOS GORGON" };

export default function StoresPage() {
  return (
    <InfoPage
      kicker="Store Locator"
      title="Find Us."
      intro="Kallos Gorgon is currently an online-first label based in Manila, delivering nationwide across the Philippines."
      sections={[
        { heading: "Online Store", body: <p>Our full collection is available here on the website, open 24/7 with secure checkout.</p> },
        { heading: "Metro Manila", body: <p>Our studio is based in Manila, Philippines. Pop-up appearances and showroom visits will be announced on this website.</p> },
        { heading: "Delivery", body: <p>We ship nationwide. Order updates are sent to the email address provided at checkout.</p> },
      ]}
    />
  );
}
