import type { Metadata } from "next";
import Link from "next/link";
import { getPartnersucheHub, partnersucheCanonical } from "@/lib/icony-partnersuche";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const hub = await getPartnersucheHub();
  return {
    title: hub.title,
    description: hub.description,
    alternates: {
      canonical: partnersucheCanonical(),
    },
    openGraph: {
      title: hub.title,
      description: hub.description,
      url: partnersucheCanonical(),
    },
  };
}

export default async function PartnersucheHubPage() {
  const hub = await getPartnersucheHub();

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-brand">
        <span className="eyebrow">Partnersuche</span>
        <h1>{hub.title}</h1>
        <p>{hub.description}</p>
        <div className="button-row">
          <Link className="button button-primary" href="https://tierisch-verliebt.de/?AID=location">
            Tierliebe Singles finden
          </Link>
          <Link className="button button-secondary" href="/magazin">
            Zum Magazin
          </Link>
        </div>
      </section>

      <section className="content-section">
        <article className="panel-card">
          <div className="section-header">
            <span className="eyebrow">Städteübersicht</span>
            <h2>Wähle deine Stadt für den regionalen Einstieg</h2>
          </div>
          <p>
            Hier findest du die regionalen Einstiege aus dem bisherigen ICONY-CMS jetzt direkt im neuen Frontend — mit
            bekannten Städten, tierfreundlichen Themen und dem direkten Weg zur Anmeldung.
          </p>
          <div className="city-grid">
            {hub.cities.map((city) => (
              <Link key={city.slug} className="city-card" href={city.href}>
                <span className="eyebrow eyebrow-muted">Partnersuche</span>
                <h3>{city.cityName}</h3>
                <p>Tierliebe Singles, Treffpunkte und hilfreiche Einstiege für {city.cityName}.</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
