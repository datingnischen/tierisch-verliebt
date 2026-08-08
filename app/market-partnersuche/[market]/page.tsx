import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketLink } from "@/components/market-link";
import { getMarketPartnersucheHub } from "@/lib/market-partnersuche";
import { getMarket, isMarketCode, publicUrl, type RegionalMarket } from "@/lib/markets";

type Props = { params: Promise<{ market: string }> };

function active(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export function generateStaticParams() {
  return [{ market: "at" }, { market: "ch" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const market = active((await params).market);
  const hub = getMarketPartnersucheHub(market);
  return {
    title: { absolute: `${hub.title} | tierisch-verliebt.${market}` },
    description: hub.description,
    alternates: { canonical: publicUrl(market, "/partnersuche") },
    robots: { index: true, follow: true },
    openGraph: { title: hub.title, description: hub.description, url: publicUrl(market, "/partnersuche") },
  };
}

export default async function MarketHub({ params }: Props) {
  const market = active((await params).market);
  const hub = getMarketPartnersucheHub(market);
  const config = getMarket(market);
  const cityCount = hub.cities.length;

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-brand">
        <span className="eyebrow">Partnersuche für Tierfreunde · {config.countryName}</span>
        <h1>{hub.title}</h1>
        <p>{hub.description}</p>
        <div className="chip-row">
          <span className="trust-chip">{cityCount} regionale Stadtseiten</span>
          <span className="trust-chip">Echte Profilvorschauen</span>
          <span className="trust-chip">Landesweit kostenlos starten</span>
        </div>
        <div className="button-row">
          <a className="button button-primary" href={publicUrl(market, "/registration/?AID=location")}>Tierliebe Singles finden</a>
          <MarketLink className="button button-secondary" market={market} path="/">Zur Startseite</MarketLink>
        </div>
      </section>

      {hub.editorial.heroImageUrl ? (
        <section className="content-section">
          <figure className="article-hero-media">
            <img src={hub.editorial.heroImageUrl} alt={hub.editorial.heroImageAlt || hub.title} loading="eager" decoding="async" />
          </figure>
        </section>
      ) : null}

      <section className="content-section">
        <article className="panel-card">
          <div className="section-header">
            <span className="eyebrow">Städteübersicht</span>
            <h2>Tierliebe Singles und lokale Tipps in {config.countryName}</h2>
            <p>Wähle deine Stadt für Profile aus der Region, tierfreundliche Orte und Ideen zum Kennenlernen.</p>
          </div>
          {hub.editorial.introParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="city-grid">
            {hub.cities.map((city) => (
              <MarketLink key={city.slug} market={market} path={city.href} className="city-card city-card-with-media">
                {city.imageUrl ? (
                  <div className="city-card-media">
                    <img src={city.imageUrl} alt={city.imageAlt || `Partnersuche in ${city.cityName}`} loading="lazy" decoding="async" />
                  </div>
                ) : null}
                <div className="city-card-copy">
                  <span className="eyebrow eyebrow-muted">Tierliebe Singles</span>
                  <h3>{city.cityName}</h3>
                  <p>Singles {city.cityName} entdecken</p>
                </div>
              </MarketLink>
            ))}
          </div>
        </article>
      </section>

      {hub.editorial.sections.map((section) => (
        <section key={section.heading} className="content-section">
          <article className="panel-card">
            {section.imageUrl ? (
              <figure className="article-hero-media">
                <img src={section.imageUrl} alt={section.imageAlt || section.heading} loading="lazy" decoding="async" />
              </figure>
            ) : null}
            <div className="section-header">
              <span className="eyebrow">Mehr Tierliebe in {config.countryName}</span>
              <h2>{section.heading}</h2>
            </div>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        </section>
      ))}
    </main>
  );
}
