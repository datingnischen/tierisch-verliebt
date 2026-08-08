import type { Metadata } from "next";
import Link from "next/link";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { getAuthorProfile } from "@/lib/author-profiles";
import { ABOUT_OVERVIEW_PATH, aboutSocialMediaCanonical } from "@/lib/about-section";
import { getSocialMediaPage } from "@/lib/icony-static-pages";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSocialMediaPage();
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: aboutSocialMediaCanonical(),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: aboutSocialMediaCanonical(),
      images: page.imageUrl ? [page.imageUrl] : undefined,
    },
  };
}

export default async function AboutSocialMediaPage() {
  const [page, expert] = await Promise.all([getSocialMediaPage(), getAuthorProfile("christian-m-haas")]);

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-brand">
        <span className="eyebrow">Über uns · Social Media</span>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        <div className="button-row">
          <Link className="button button-secondary" href={ABOUT_OVERVIEW_PATH}>
            Zur Über-uns-Übersicht
          </Link>
        </div>
      </section>

      <section className="content-section">
        <article className="panel-card">
          <div className="section-header">
            <span className="eyebrow">Unsere Kanäle im Überblick</span>
            <h2>Offizielle Kanäle und Community-Einstiege</h2>
          </div>
          <div className="rich-content social-content" dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
        </article>
      </section>

      {expert ? (
        <section className="content-section">
          <ExpertTrustCard
            profile={expert}
            eyebrow="Unser Datingexperte"
            title="Bleib über die offiziellen Social-Media-Kanäle von tierisch-verliebt mit der Community, neuen Geschichten und tierlieben Themen in Kontakt."
            primaryLabel="Zum Expertenprofil"
          />
        </section>
      ) : null}
    </main>
  );
}
