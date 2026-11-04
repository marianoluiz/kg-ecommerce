import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = { title: "Sitemap | KALLOS GORGON" };

const groups: { heading: string; links: [string, string][] }[] = [
  { heading: "Shop", links: [["Home", "/"], ["Collection", "/#shop"], ["Cart & Checkout", "/checkout"]] },
  { heading: "Account", links: [["Login / Sign Up", "/login"], ["My Account", "/account"]] },
  { heading: "Company", links: [["About Group 5", "/#about"], ["The Kallos Gorgon Ethos", "/ethos"], ["Quadros Technology™", "/quadros"], ["Sustainability", "/sustainability"], ["Careers", "/careers"], ["Store Locator", "/stores"]] },
  { heading: "Legal", links: [["Cookie Policy", "/cookies"]] },
];

export default function SitemapPage() {
  return (
    <InfoPage
      kicker="Navigation"
      title="Sitemap"
      intro="Every page on the Kallos Gorgon website."
      sections={groups.map((g) => ({
        heading: g.heading,
        body: (
          <ul className="info-links">
            {g.links.map(([label, href]) => (
              <li key={href}><Link href={href}>{label}</Link></li>
            ))}
          </ul>
        ),
      }))}
    />
  );
}
