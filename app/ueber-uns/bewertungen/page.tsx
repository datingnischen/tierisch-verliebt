import type { Metadata } from "next";
import Link from "@/components/link";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { SiteJsonLd } from "@/components/site-json-ld";
import { getAuthorProfile } from "@/lib/author-profiles";
import { ABOUT_OVERVIEW_PATH, aboutReviewsCanonical } from "@/lib/about-section";
import { getReviewsPage } from "@/lib/icony-static-pages";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getReviewsPage();
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: aboutReviewsCanonical(),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: aboutReviewsCanonical(),
      images: page.imageUrl ? [page.imageUrl] : undefined,
    },
  };
}

export default async function AboutReviewsPage() {
  const [page, expert] = await Promise.all([getReviewsPage(), getAuthorProfile("christian-m-haas")]);

  return (
    <main className="shell shell-narrow">
      <SiteJsonLd page={{ type: "AboutPage", url: aboutReviewsCanonical(), name: page.title, description: page.description }} />
      <section className="hero-card hero-brand social-hero">
        <div className="social-hero-copy">
          <span className="eyebrow">Über uns · Bewertungen</span>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <div className="button-row">
            <a className="button button-primary" href="https://www.trustpilot.com/review/tierisch-verliebt.de" target="_blank" rel="noopener">
              Bewertungen auf Trustpilot
            </a>
            <Link className="button button-secondary" href={ABOUT_OVERVIEW_PATH}>
              Zur Über-uns-Übersicht
            </Link>
          </div>
        </div>
        {page.imageUrl ? (
          <figure className="social-hero-media">
            <img src={page.imageUrl} alt={page.imageAlt || "Bewertungen"} loading="eager" decoding="async" />
          </figure>
        ) : null}
      </section>

      <section className="rich-content">
        <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
      </section>

      {expert ? (
        <section className="content-section">
          <ExpertTrustCard
            profile={expert}
            eyebrow="Unser Datingexperte"
            title="Echte Bewertungen, unabhängige Vergleichsportale und ein sichtbarer Experte: So kannst du tierisch-verliebt einschätzen, bevor du dich anmeldest."
            primaryLabel="Zum Expertenprofil"
          />
        </section>
      ) : null}
    </main>
  );
}
