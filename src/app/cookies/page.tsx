import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Cookie Policy | KALLOS GORGON" };

export default function CookiesPage() {
  return (
    <InfoPage
      kicker="Legal"
      title="Cookie Policy"
      intro="This policy explains how Kallos Gorgon uses cookies and similar browser storage on this website."
      sections={[
        { heading: "Essential Cookies", body: <p>We use essential cookies to keep you signed in and to secure your session. These are required for the account and checkout features to work.</p> },
        { heading: "Local Storage", body: <p>Your shopping cart is stored in your browser so it persists between visits. It is not shared with third parties.</p> },
        { heading: "Payment Providers", body: <p>When you check out, our payment provider (PayPal) may set its own cookies to process and protect your transaction, governed by its own policies.</p> },
        { heading: "Managing Cookies", body: <p>You can clear or block cookies in your browser settings. Blocking essential cookies may prevent sign-in and checkout from working.</p> },
        { heading: "Data Privacy", body: <p>We handle personal information in line with the Data Privacy Act of 2012 (R.A. 10173) and the E-Commerce Act (R.A. 8792).</p> },
      ]}
    />
  );
}
