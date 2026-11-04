import Link from "next/link";
import type { ReactNode } from "react";

export type InfoSection = { heading: string; body: ReactNode };

export function InfoPage({ kicker, title, intro, sections, cta }: {
  kicker: string;
  title: string;
  intro: string;
  sections: InfoSection[];
  cta?: { href: string; label: string };
}) {
  return (
    <section className="info-page">
      <div className="info-container">
        <header className="info-header">
          <p className="info-kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className="info-intro">{intro}</p>
        </header>
        <div className="info-sections">
          {sections.map((s) => (
            <article className="info-block" key={s.heading}>
              <h2>{s.heading}</h2>
              <div className="info-body">{s.body}</div>
            </article>
          ))}
        </div>
        <Link href={cta?.href ?? "/#shop"} className="btn">{cta?.label ?? "Explore The Collection"}</Link>
      </div>
    </section>
  );
}
