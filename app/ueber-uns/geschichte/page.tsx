import type { Metadata } from "next";
import Link from "next/link";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { getAuthorProfile } from "@/lib/author-profiles";
import { ABOUT_OVERVIEW_PATH, aboutStoryCanonical, getAboutStoryPage } from "@/lib/about-section";
import { stripHtml } from "@/lib/wordpress";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const entry = await getAboutStoryPage();
  const description = stripHtml(entry.excerpt || entry.content).slice(0, 155);
  return {
    title: entry.title,
    description,
    alternates: {
      canonical: aboutStoryCanonical(),
    },
    openGraph: {
      title: entry.title,
      description,
      url: aboutStoryCanonical(),
      images: entry.featuredImage ? [entry.featuredImage] : undefined,
    },
  };
}

export default async function AboutStoryPage() {
  const [entry, authorProfile] = await Promise.all([getAboutStoryPage(), getAuthorProfile("christian-m-haas")]);

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-magazine">
        <span className="eyebrow">Über uns · Geschichte</span>
        <h1>{entry.title}</h1>
        <p>{stripHtml(entry.excerpt || entry.content).slice(0, 220)}…</p>
        <div className="button-row">
          <Link className="button button-secondary" href={ABOUT_OVERVIEW_PATH}>
            Zur Über-uns-Übersicht
          </Link>
          <Link className="button button-primary" href="https://tierisch-verliebt.de/?AID=magazin">
            Kostenlos registrieren
          </Link>
        </div>
      </section>

      {entry.featuredImage ? (
        <section className="content-section">
          <figure className="article-hero-media">
            <img src={entry.featuredImage} alt={entry.featuredImageAlt || entry.title} loading="eager" decoding="async" />
          </figure>
        </section>
      ) : null}

      <section className="rich-content">
        <div dangerouslySetInnerHTML={{ __html: entry.content }} />
      </section>

      {authorProfile ? (
        <section className="content-section">
          <ExpertTrustCard
            profile={authorProfile}
            eyebrow="Unser Datingexperte"
            title="Die Über-uns-Seiten von tierisch-verliebt bleiben an echte Inhalte, nachvollziehbare Historie und sichtbare Ansprechpartner geknüpft."
            primaryLabel="Zum Expertenprofil"
          />
        </section>
      ) : null}
    </main>
  );
}
