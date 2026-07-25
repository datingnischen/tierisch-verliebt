import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { getAuthorProfile } from "@/lib/author-profiles";
import {
  getNearbyPartnersucheCities,
  getPartnersucheCity,
  getPartnersucheSlugs,
  partnersucheCanonical,
} from "@/lib/icony-partnersuche";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getPartnersucheSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = await getPartnersucheCity(slug);
  if (!city) return {};

  return {
    title: city.title,
    description: city.description,
    alternates: {
      canonical: partnersucheCanonical(`/partnersuche/${slug}`),
    },
    openGraph: {
      title: city.title,
      description: city.description,
      url: partnersucheCanonical(`/partnersuche/${slug}`),
      images: city.imageUrl ? [city.imageUrl] : undefined,
    },
  };
}

export default async function PartnersucheCityPage({ params }: PageProps) {
  const { slug } = await params;
  const [city, nearbyCities, expert] = await Promise.all([
    getPartnersucheCity(slug),
    getNearbyPartnersucheCities(slug),
    getAuthorProfile("christian-m-haas"),
  ]);

  if (!city) notFound();

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-brand">
        <span className="eyebrow">Partnersuche in {city.cityName}</span>
        <h1>{city.title}</h1>
        <p>{city.description}</p>
        <div className="button-row">
          <Link className="button button-primary" href="https://tierisch-verliebt.de/?AID=location">
            Tierliebe Singles in {city.cityName} finden
          </Link>
          <Link className="button button-secondary" href="/partnersuche">
            Zur Städteübersicht
          </Link>
        </div>
      </section>

      {city.imageUrl ? (
        <section className="content-section">
          <figure className="article-hero-media">
            <img src={city.imageUrl} alt={city.imageAlt || city.title} loading="eager" decoding="async" />
          </figure>
        </section>
      ) : null}

      <section className="content-section">
        <article className="panel-card">
          <div className="section-header">
            <span className="eyebrow">Importierter Stadtinhalt</span>
            <h2>Tierfreundliche Orte, Treffpunkte und regionale Tipps</h2>
          </div>
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: city.contentHtml }} />
        </article>
      </section>

      <section className="content-section">
        <article className="panel-card">
          <div className="section-header">
            <span className="eyebrow">Weitere Städte</span>
            <h2>Mehr regionale Einstiege für tierliebe Singles</h2>
          </div>
          <div className="city-grid city-grid-compact">
            {nearbyCities.map((entry) => (
              <Link key={entry.slug} className="city-card" href={entry.href}>
                <span className="eyebrow eyebrow-muted">Stadtseite</span>
                <h3>{entry.cityName}</h3>
                <p>Mehr lesen und tierliebe Singles in {entry.cityName} entdecken.</p>
              </Link>
            ))}
          </div>
        </article>
      </section>

      {expert ? (
        <section className="content-section">
          <ExpertTrustCard
            profile={expert}
            eyebrow="Unser Datingexperte"
            title={`Christian begleitet tierliebe Dating-Themen, regionale Einstiege und Magazin-Inhalte auch für ${city.cityName}.`}
            primaryLabel="Zum Expertenprofil"
          />
        </section>
      ) : null}
    </main>
  );
}
