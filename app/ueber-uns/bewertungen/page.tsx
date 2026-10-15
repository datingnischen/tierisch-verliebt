import type { Metadata } from "next";
import Link from "@/components/link";
import { AboutPolaroid, AboutShell } from "@/components/about/about-shell";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { SiteJsonLd } from "@/components/site-json-ld";
import { getAuthorProfile } from "@/lib/author-profiles";
import { ABOUT_OVERVIEW_PATH, ABOUT_REVIEWS_PATH, aboutReviewsCanonical } from "@/lib/about-section";
import { getReviewsPage } from "@/lib/icony-static-pages";
import { limitStrong } from "@/lib/html-cleanup";

export const revalidate = 3600;

// Eigener Titel und eigene Description: Die ICONY-Seite /bewertungen-und-erfahrungen/ bleibt online, gleiche Metadaten gälten als Dublette.
const REVIEWS_TITLE = "Bewertungen & Erfahrungen";
const REVIEWS_DESCRIPTION =
  "Was Mitglieder über tierisch-verliebt.de sagen: Bewertungen und Erfahrungen aus der Singlebörse für Tierfreunde, dazu unser Trustpilot-Profil.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getReviewsPage();
  return {
    title: REVIEWS_TITLE,
    description: REVIEWS_DESCRIPTION,
    alternates: {
      canonical: aboutReviewsCanonical(),
    },
    openGraph: {
      title: REVIEWS_TITLE,
      description: REVIEWS_DESCRIPTION,
      url: aboutReviewsCanonical(),
      images: page.imageUrl ? [page.imageUrl] : undefined,
    },
  };
}

export default async function AboutReviewsPage() {
  const [page, expert] = await Promise.all([getReviewsPage(), getAuthorProfile("christian-m-haas")]);

  return (
    <AboutShell
      current={ABOUT_REVIEWS_PATH}
      crumb="Bewertungen"
      badge="Über uns · Bewertungen"
      title={page.title}
      lead={page.description}
      actions={
        <>
          <a className="tvc-btn tvc-btn-primary" href="https://www.trustpilot.com/review/tierisch-verliebt.de" target="_blank" rel="noopener">
            Bewertungen auf Trustpilot
          </a>
          <Link className="tvc-btn tvc-btn-ghost" href={ABOUT_OVERVIEW_PATH}>
            Zur Über-uns-Übersicht
          </Link>
        </>
      }
      aside={page.imageUrl ? <AboutPolaroid src={page.imageUrl} alt={page.imageAlt || "Bewertungen"} caption="Echte Stimmen aus der Community" /> : undefined}
    >
      <SiteJsonLd page={{ type: "AboutPage", url: aboutReviewsCanonical(), name: page.title, description: page.description }} />
      <div className="tvc-wrap tva-body">
      <section className="rich-content">
        {/* ICONY-Text nennt die Marke viermal fett: Seobility „doppelte Strong-Tags“. */}
        <div dangerouslySetInnerHTML={{ __html: limitStrong(page.contentHtml) }} />
      </section>

      {expert ? (
        <section>
          <ExpertTrustCard
            profile={expert}
            eyebrow="Unser Datingexperte"
            title="Echte Bewertungen, unabhängige Vergleichsportale und ein sichtbarer Experte: So kannst du tierisch-verliebt einschätzen, bevor du dich anmeldest."
            primaryLabel="Zum Expertenprofil"
            variant="compact"
          />
        </section>
      ) : null}
      </div>
    </AboutShell>
  );
}
