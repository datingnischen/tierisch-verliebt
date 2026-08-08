import type { Metadata } from "next";
import Link from "next/link";
import { getMarketPartnersucheHub } from "@/lib/market-partnersuche";
import { publicUrl } from "@/lib/markets";

export const revalidate = 86400;

export function generateMetadata(): Metadata {
  const hub = getMarketPartnersucheHub("de");
  return { title: hub.title, description: hub.description, alternates: { canonical: publicUrl("de", "/partnersuche") }, openGraph: { title: hub.title, description: hub.description, url: publicUrl("de", "/partnersuche") } };
}

export default function PartnersucheHubPage() {
  const hub = getMarketPartnersucheHub("de");
  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-brand">
        <span className="eyebrow">Partnersuche für Tierfreunde</span>
        <h1>{hub.title}</h1>
        <p>{hub.description}</p>
        <div className="chip-row"><span className="trust-chip">20 regionale Stadtseiten</span><span className="trust-chip">Echte Profilvorschauen</span><span className="trust-chip">Lokale Tipps & Treffpunkte</span></div>
        <div className="button-row"><a className="button button-primary" href="https://tierisch-verliebt.de/registration/?AID=location">Kostenlos tierliebe Singles finden</a><Link className="button button-secondary" href="/magazin">Zum Tier-Magazin</Link></div>
      </section>
      <section className="content-section"><article className="panel-card">
        <div className="section-header"><span className="eyebrow">Städteübersicht</span><h2>Wähle deine Stadt für den regionalen Einstieg</h2><p>Jede Stadtseite verbindet aktuelle Profile mit tierfreundlichen Orten, Ausflugsideen und Tipps für ein entspanntes Kennenlernen.</p></div>
        <div className="city-grid">{hub.cities.map((city) => <Link key={city.slug} className="city-card city-card-with-media" href={city.href}>{city.imageUrl ? <div className="city-card-media"><img src={city.imageUrl} alt={city.imageAlt || `Tierliebe Partnersuche in ${city.cityName}`} loading="lazy" decoding="async" /></div> : null}<div className="city-card-copy"><span className="eyebrow eyebrow-muted">Tierliebe Singles</span><h3>{city.cityName}</h3><p>Singles {city.cityName} entdecken</p></div></Link>)}</div>
      </article></section>
    </main>
  );
}
