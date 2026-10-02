import type { Metadata } from "next";
import Link from "@/components/link";
import { AboutPolaroid, AboutShell } from "@/components/about/about-shell";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { getAuthorProfile } from "@/lib/author-profiles";
import { ABOUT_OVERVIEW_PATH, ABOUT_STORY_PATH, aboutStoryCanonical, getAboutStoryPage } from "@/lib/about-section";
import { stripHtml } from "@/lib/magazine";

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
    <AboutShell
      current={ABOUT_STORY_PATH}
      crumb="Geschichte"
      badge="Über uns · Geschichte"
      title={entry.title}
      lead={`${stripHtml(entry.excerpt || entry.content).slice(0, 220)}…`}
      actions={
        <>
          <Link className="tvc-btn tvc-btn-primary" href="https://tierisch-verliebt.de/registration/?AID=location">
            Kostenlos registrieren
          </Link>
          <Link className="tvc-btn tvc-btn-ghost" href={ABOUT_OVERVIEW_PATH}>
            Zur Über-uns-Übersicht
          </Link>
        </>
      }
      aside={authorProfile?.imageUrl ? <AboutPolaroid src={authorProfile.imageUrl} alt={authorProfile.name} caption={`${authorProfile.name} · ${authorProfile.jobTitle}`} /> : undefined}
    >
      <div className="tvc-wrap tva-body">

      {entry.featuredImage ? (
        <section>
          <figure className="tva-figure">
            <img src={entry.featuredImage} alt={entry.featuredImageAlt || entry.title} loading="eager" decoding="async" />
          </figure>
        </section>
      ) : null}

      <section className="rich-content">
        <div dangerouslySetInnerHTML={{ __html: entry.content }} />
      </section>

      {authorProfile ? (
        <section>
          <ExpertTrustCard
            profile={authorProfile}
            eyebrow="Unser Datingexperte"
            title="Die Über-uns-Seiten von tierisch-verliebt bleiben an echte Inhalte, nachvollziehbare Historie und sichtbare Ansprechpartner geknüpft."
            primaryLabel="Zum Expertenprofil"
          />
        </section>
      ) : null}
      </div>
    </AboutShell>
  );
}
