import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconySinglesWidget } from "@/components/icony-singles-widget";
import { MarketLink } from "@/components/market-link";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { getAuthorProfile } from "@/lib/author-profiles";
import { getMarketCityPage, getMarketCityPages, getNearbyMarketCities } from "@/lib/market-partnersuche";
import { publicUrl } from "@/lib/markets";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 86400;

export function generateStaticParams() {
  return getMarketCityPages("de").map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getMarketCityPage("de", slug);
  if (!city) return {};
  return {
    title: city.title,
    description: city.description,
    alternates: { canonical: publicUrl("de", city.path) },
    openGraph: {
      title: city.title,
      description: city.description,
      url: publicUrl("de", city.path),
      images: city.imageUrl ? [city.imageUrl] : undefined,
    },
  };
}

export default async function PartnersucheCityPage({ params }: PageProps) {
  const { slug } = await params;
  const [city, expert] = [getMarketCityPage("de", slug), await getAuthorProfile("christian-m-haas")];
  if (!city) notFound();
  const nearby = getNearbyMarketCities("de", slug);

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-brand">
        <span className="eyebrow">Tierliebe Partnersuche in {city.cityName}</span>
        <h1>{city.title}</h1>
        <p>{city.description}</p>
        <div className="chip-row">
          <span className="trust-chip">Profile aus der Region</span>
          <span className="trust-chip">Tipps für Tierfreunde</span>
          <span className="trust-chip">Kostenlos starten</span>
        </div>
        <div className="button-row">
          <a className="button button-primary" href={city.registrationUrl}>Tierliebe Singles in {city.cityName} finden</a>
          <MarketLink className="button button-secondary" market="de" path="/partnersuche">Alle Städte</MarketLink>
        </div>
      </section>
      <section className="content-section"><IconySinglesWidget city={city.cityName} zip={city.icony.zip} country={city.icony.country} platformId={city.icony.platformId} registrationUrl={city.registrationUrl} searchUrl={city.searchUrl} /></section>
      <section className="content-section"><article className="panel-card"><div className="section-header"><span className="eyebrow">Tipps & Highlights vor Ort</span><h2>Tierfreundliche Orte und Ideen für {city.cityName}</h2></div><div className="rich-content" dangerouslySetInnerHTML={{ __html: city.contentHtml }} /></article></section>
      <section className="content-section"><article className="panel-card"><div className="section-header"><span className="eyebrow">Weitere Städte</span><h2>Mehr regionale Einstiege für tierliebe Singles</h2></div><div className="city-grid city-grid-compact">{nearby.map((entry) => <MarketLink key={entry.slug} className="city-card" market="de" path={entry.path}><span className="eyebrow eyebrow-muted">Tierliebe Singles</span><h3>{entry.cityName}</h3><p>Singles {entry.cityName} entdecken</p></MarketLink>)}</div></article></section>
      {expert ? <section className="content-section"><ExpertTrustCard profile={expert} eyebrow="Unser Datingexperte" title={`Christian begleitet tierliebe Dating-Themen und regionale Einstiege auch für ${city.cityName}.`} primaryLabel="Zum Expertenprofil" /></section> : null}
    </main>
  );
}
