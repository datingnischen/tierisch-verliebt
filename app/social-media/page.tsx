import type { Metadata } from "next";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { getAuthorProfile } from "@/lib/author-profiles";
import { getSocialMediaPage, socialMediaCanonical } from "@/lib/icony-static-pages";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSocialMediaPage();
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: socialMediaCanonical(),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: socialMediaCanonical(),
      images: page.imageUrl ? [page.imageUrl] : undefined,
    },
  };
}

export default async function SocialMediaPage() {
  const [page, expert] = await Promise.all([getSocialMediaPage(), getAuthorProfile("christian-m-haas")]);

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-brand">
        <span className="eyebrow">Social Media</span>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
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
            title="Bleib über Social Media mit tierisch-verliebt, neuen Geschichten und tierlieben Community-Themen in Kontakt."
            primaryLabel="Zum Expertenprofil"
          />
        </section>
      ) : null}
    </main>
  );
}
