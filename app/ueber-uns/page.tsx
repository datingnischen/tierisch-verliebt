import type { Metadata } from "next";
import Link from "next/link";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { getAuthorProfile } from "@/lib/author-profiles";
import {
  ABOUT_SOCIAL_MEDIA_PATH,
  ABOUT_STORY_PATH,
  aboutOverviewCanonical,
  getAboutStoryPage,
} from "@/lib/about-section";
import { getSocialMediaPage } from "@/lib/icony-static-pages";
import { stripHtml } from "@/lib/wordpress";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Über tierisch-verliebt.de",
  description:
    "Lerne tierisch-verliebt, die Geschichte der Marke und unsere offiziellen Social-Media-Kanäle in einer gebündelten Über-uns-Struktur kennen.",
  alternates: {
    canonical: aboutOverviewCanonical(),
  },
  openGraph: {
    title: "Über tierisch-verliebt.de",
    description:
      "Lerne tierisch-verliebt, die Geschichte der Marke und unsere offiziellen Social-Media-Kanäle in einer gebündelten Über-uns-Struktur kennen.",
    url: aboutOverviewCanonical(),
  },
};

export default async function AboutOverviewPage() {
  const [story, social, expert] = await Promise.all([
    getAboutStoryPage(),
    getSocialMediaPage(),
    getAuthorProfile("christian-m-haas"),
  ]);

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-brand">
        <span className="eyebrow">Über uns</span>
        <h1>Wer hinter tierisch-verliebt steht, wie die Marke gewachsen ist und wo du uns findest.</h1>
        <p>
          Dieser Bereich bündelt die wichtigsten Vertrauens- und Hintergrundseiten von tierisch-verliebt — von
          unserer Geschichte bis zu den offiziellen Social-Media-Kanälen.
        </p>
        <div className="button-row">
          <Link className="button button-primary" href={ABOUT_STORY_PATH}>
            Unsere Geschichte lesen
          </Link>
          <Link className="button button-secondary" href={ABOUT_SOCIAL_MEDIA_PATH}>
            Zu Social Media
          </Link>
        </div>
      </section>

      <section className="grid-two content-section">
        <article className="panel-card">
          <div className="section-header">
            <span className="eyebrow">Geschichte</span>
            <h2>{story.title}</h2>
          </div>
          <p>{stripHtml(story.excerpt || story.content).slice(0, 260)}…</p>
          <Link className="button button-primary" href={ABOUT_STORY_PATH}>
            Geschichte öffnen
          </Link>
        </article>

        <article className="panel-card">
          <div className="section-header">
            <span className="eyebrow">Community & Kanäle</span>
            <h2>{social.title}</h2>
          </div>
          <p>{social.lead || social.description}</p>
          <Link className="button button-primary" href={ABOUT_SOCIAL_MEDIA_PATH}>
            Social Media ansehen
          </Link>
        </article>
      </section>

      {expert ? (
        <section className="content-section">
          <ExpertTrustCard
            profile={expert}
            eyebrow="Unser Datingexperte"
            title="Hinter tierisch-verliebt stehen reale Inhalte, nachvollziehbare Hintergründe und sichtbare Community-Kanäle statt anonymer Platzhalterseiten."
            primaryLabel="Zum Expertenprofil"
          />
        </section>
      ) : null}
    </main>
  );
}
