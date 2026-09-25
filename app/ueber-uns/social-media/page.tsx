import type { Metadata } from "next";
import Link from "@/components/link";
import { AuthorSocialIcon } from "@/components/author-social-icon";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { SiteJsonLd } from "@/components/site-json-ld";
import { getAuthorProfile } from "@/lib/author-profiles";
import { ABOUT_OVERVIEW_PATH, aboutSocialMediaCanonical } from "@/lib/about-section";
import { getSocialMediaPage } from "@/lib/icony-static-pages";
import { SOCIAL_CHANNELS, SOCIAL_COMMUNITY_GROUP } from "@/lib/social-channels";

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
      <SiteJsonLd
        page={{ type: "AboutPage", url: aboutSocialMediaCanonical(), name: page.title, description: page.description }}
      />
      <section className="hero-card hero-brand social-hero">
        <div className="social-hero-copy">
          <span className="eyebrow">Über uns · Social Media</span>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <ul className="social-hero-icons" aria-label="Unsere Kanäle">
            {SOCIAL_CHANNELS.map((channel) => (
              <li key={channel.platform}>
                <a
                  className={`social-bubble social-${channel.platform}`}
                  href={channel.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={channel.name}
                >
                  <AuthorSocialIcon platform={channel.platform} size={20} />
                </a>
              </li>
            ))}
          </ul>
          <div className="button-row">
            <Link className="button button-secondary" href={ABOUT_OVERVIEW_PATH}>
              Zur Über-uns-Übersicht
            </Link>
          </div>
        </div>
        {page.imageUrl ? (
          <figure className="social-hero-media">
            <img src={page.imageUrl} alt={page.imageAlt || "Frau mit Hund"} loading="eager" decoding="async" />
          </figure>
        ) : null}
      </section>

      <section className="content-section">
        <div className="section-header">
          <span className="eyebrow">Unsere Kanäle</span>
          <h2>Folge uns dort, wo du ohnehin scrollst</h2>
        </div>
        <div className="social-channel-grid">
          {SOCIAL_CHANNELS.map((channel) => (
            <a
              key={channel.platform}
              className={`social-channel-card social-${channel.platform}`}
              href={channel.href}
              target="_blank"
              rel="noopener"
            >
              <span className="social-channel-top">
                <span className="social-bubble">
                  <AuthorSocialIcon platform={channel.platform} size={24} />
                </span>
                <span className="social-channel-kind">{channel.kind}</span>
              </span>
              <span className="social-channel-name">{channel.name}</span>
              <span className="social-channel-handle">{channel.handle}</span>
              <span className="social-channel-text">{channel.description}</span>
              <span className="social-channel-cta">
                {channel.cta} <span aria-hidden="true">→</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="social-community">
          <span className="social-bubble social-facebook">
            <AuthorSocialIcon platform={SOCIAL_COMMUNITY_GROUP.platform} size={26} />
          </span>
          <div className="social-community-copy">
            <span className="eyebrow">Community</span>
            <h2>{SOCIAL_COMMUNITY_GROUP.name}</h2>
            <p>{SOCIAL_COMMUNITY_GROUP.description}</p>
          </div>
          <a className="button button-primary" href={SOCIAL_COMMUNITY_GROUP.href} target="_blank" rel="noopener">
            {SOCIAL_COMMUNITY_GROUP.cta}
          </a>
        </div>
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
