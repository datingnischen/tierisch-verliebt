import type { Metadata } from "next";
import Link from "@/components/link";
import { AboutSearchForm } from "@/components/about-search-form";
import { AboutPolaroid, AboutShell } from "@/components/about/about-shell";
import { AuthorSocialIcon } from "@/components/author-social-icon";
import { PawIcon } from "@/components/city-page/tier-icons";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { SiteJsonLd } from "@/components/site-json-ld";
import { getAuthorProfile } from "@/lib/author-profiles";
import {
  ABOUT_OVERVIEW_PATH,
  ABOUT_PRESS_PATH,
  ABOUT_REVIEWS_PATH,
  ABOUT_SOCIAL_MEDIA_PATH,
  ABOUT_STORY_PATH,
  aboutOverviewCanonical,
  getAboutStoryPage,
} from "@/lib/about-section";
import { FAQ_PATH } from "@/lib/faq";
import { getReviewsPage, getSocialMediaPage } from "@/lib/icony-static-pages";
import { SOCIAL_CHANNELS } from "@/lib/social-channels";
import { stripHtml } from "@/lib/magazine";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Über tierisch-verliebt.de",
  description:
    "Lerne tierisch-verliebt, die Geschichte der Marke, Presse- und Sponsoring-Themen und unsere offiziellen Social-Media-Kanäle in einer gebündelten Über-uns-Struktur kennen.",
  alternates: {
    canonical: aboutOverviewCanonical(),
  },
  openGraph: {
    title: "Über tierisch-verliebt.de",
    description:
      "Lerne tierisch-verliebt, die Geschichte der Marke, Presse- und Sponsoring-Themen und unsere offiziellen Social-Media-Kanäle in einer gebündelten Über-uns-Struktur kennen.",
    url: aboutOverviewCanonical(),
  },
};

function excerpt(value: string, max = 170) {
  const text = stripHtml(value).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
}

export default async function AboutOverviewPage() {
  const [story, social, reviews, expert] = await Promise.all([
    getAboutStoryPage(),
    getSocialMediaPage(),
    getReviewsPage(),
    getAuthorProfile("christian-m-haas"),
  ]);

  const tiles = [
    {
      href: ABOUT_STORY_PATH,
      kicker: "Geschichte",
      title: story.title,
      text: excerpt(story.excerpt || story.content),
      cta: "Geschichte lesen",
      image: story.featuredImage || null,
    },
    {
      href: ABOUT_REVIEWS_PATH,
      kicker: "Bewertungen & Erfahrungen",
      title: reviews.title,
      text: excerpt(reviews.lead || reviews.description),
      cta: "Bewertungen ansehen",
      image: reviews.imageUrl || null,
    },
    {
      href: ABOUT_SOCIAL_MEDIA_PATH,
      kicker: "Community & Kanäle",
      title: social.title,
      text: excerpt(social.lead || social.description),
      cta: "Social Media ansehen",
      image: social.imageUrl || null,
    },
    {
      href: ABOUT_PRESS_PATH,
      kicker: "Presse & Sponsoring",
      title: "Medien, Kooperationen und offizielle Beiträge",
      text: "Pressemitteilungen, Sponsorings und Veröffentlichungen rund um tierisch-verliebt – vom Radio-Spot bis zu Sport- und Vereinskooperationen.",
      cta: "Zu Presse & Sponsoring",
      image: null,
    },
  ];

  return (
    <AboutShell
      current={ABOUT_OVERVIEW_PATH}
      crumb="Über uns"
      badge="Über uns · tierisch-verliebt"
      title="Wer hinter tierisch-verliebt steht"
      lead="Wie die Marke gewachsen ist, was Mitglieder über uns sagen und wo du uns findest – die wichtigsten Vertrauens- und Hintergrundseiten auf einen Blick."
      stats={[
        { value: String(SOCIAL_CHANNELS.length), label: "Social-Media-Kanäle" },
        { value: "3", label: "Länder: DE · AT · CH" },
        { value: "0 €", label: "Registrierung" },
      ]}
      actions={
        <>
          <Link className="tvc-btn tvc-btn-primary" href={ABOUT_STORY_PATH}>Unsere Geschichte lesen</Link>
          <Link className="tvc-btn tvc-btn-ghost" href={ABOUT_REVIEWS_PATH}>Bewertungen ansehen</Link>
          <Link className="tvc-btn tvc-btn-ghost" href={FAQ_PATH}>Häufige Fragen</Link>
        </>
      }
      aside={expert?.imageUrl ? <AboutPolaroid src={expert.imageUrl} alt={`${expert.name} – ${expert.jobTitle}`} caption={`${expert.name} · ${expert.jobTitle}`} /> : undefined}
    >
      <SiteJsonLd
        page={{
          type: "AboutPage",
          url: aboutOverviewCanonical(),
          name: String(metadata.title),
          description: String(metadata.description),
        }}
      />

      <section className="tvc-wrap tva-section tva-search" aria-labelledby="tva-search-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Suche</span>
          <h2 id="tva-search-title">Du suchst einen Ratgeber, eine Rasse oder deine Stadt?</h2>
        </div>
        <AboutSearchForm />
      </section>

      <section className="tvc-wrap tva-section" aria-labelledby="tva-tiles-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Hintergründe</span>
          <h2 id="tva-tiles-title">Alles über tierisch-verliebt</h2>
          <p>Geschichte, echte Bewertungen, unsere Kanäle und Kooperationen – mit Herz und Pfote erzählt.</p>
        </div>
        <div className="tva-tiles">
          {tiles.map((tile) => (
            <Link key={tile.href} className="tva-tile" href={tile.href}>
              <span className="tva-tile-media">
                {tile.image ? <img src={tile.image} alt={tile.title} loading="lazy" decoding="async" /> : <PawIcon />}
              </span>
              <span className="tva-tile-body">
                <small>{tile.kicker}</small>
                <strong>{tile.title}</strong>
                <span>{tile.text}</span>
                <em>{tile.cta} →</em>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="tvc-wrap tva-section" aria-label="Social Media">
        <div className="tva-social">
          <div>
            <span className="tvc-eyebrow">Folge uns</span>
            <h2>Tierisch-verliebt auf Social Media</h2>
          </div>
          <ul>
            {SOCIAL_CHANNELS.map((channel) => (
              <li key={channel.platform}>
                <a href={channel.href} target="_blank" rel="noopener" aria-label={channel.name}>
                  <AuthorSocialIcon platform={channel.platform} size={22} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {expert ? (
        <section className="tvc-wrap tva-section">
          <ExpertTrustCard
            profile={expert}
            eyebrow="Unser Datingexperte"
            title="Hinter tierisch-verliebt stehen reale Inhalte, nachvollziehbare Hintergründe und sichtbare Community-Kanäle statt anonymer Platzhalterseiten."
            primaryLabel="Zum Expertenprofil"
          />
        </section>
      ) : null}

      <section className="tvc-wrap tva-section">
        <div className="tva-cta">
          <div>
            <span className="tvc-eyebrow">Mit Herz und Pfote</span>
            <h2>Finde tierliebe Singles in deiner Region</h2>
            <p>Kostenlos registrieren und Menschen kennenlernen, bei denen Hund, Katze &amp; Co. einfach dazugehören.</p>
          </div>
          <a className="tvc-btn tvc-btn-primary" href="https://tierisch-verliebt.de/registration/?AID=location">Kostenlos starten</a>
        </div>
      </section>
    </AboutShell>
  );
}
