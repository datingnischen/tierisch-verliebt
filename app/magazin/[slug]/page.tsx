import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { getAuthorProfile } from "@/lib/author-profiles";
import { SITE_URL, formatGermanDate, getMagazineEntryBySlug, stripHtml } from "@/lib/wordpress";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getMagazineEntryBySlug(slug);
  if (!entry) return {};

  const description = stripHtml(entry.excerpt || entry.content).slice(0, 155);

  return {
    title: entry.title,
    description,
    alternates: {
      canonical: `${SITE_URL}/magazin/${slug}`,
    },
    openGraph: {
      title: entry.title,
      description,
      url: `${SITE_URL}/magazin/${slug}`,
      type: entry.type === "post" ? "article" : "website",
      images: entry.featuredImage ? [entry.featuredImage] : undefined,
    },
  };
}

export default async function MagazineDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await getMagazineEntryBySlug(slug);
  if (!entry) notFound();

  const authorProfile = entry.authorSlug ? await getAuthorProfile(entry.authorSlug) : null;

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-magazine">
        <span className="eyebrow">{entry.type === "post" ? "Magazin-Artikel" : "Magazin-Seite"}</span>
        <h1>{entry.title}</h1>
        <p>{stripHtml(entry.excerpt || entry.content).slice(0, 220)}…</p>
        <div className="meta-row">
          {entry.authorName ? (
            <span>
              Von {authorProfile ? <Link href={authorProfile.profileUrl}>{entry.authorName}</Link> : entry.authorName}
            </span>
          ) : null}
          {entry.date ? <span>{formatGermanDate(entry.date)}</span> : null}
          <Link href="https://tierisch-verliebt.de/?AID=magazin">Kostenlos registrieren</Link>
        </div>
      </section>

      {entry.featuredImage ? (
        <section className="content-section">
          <figure className="article-hero-media">
            <img src={entry.featuredImage} alt={entry.featuredImageAlt || entry.title} loading="eager" decoding="async" />
          </figure>
        </section>
      ) : null}

      {entry.categories.length ? (
        <section className="content-section">
          <div className="chip-row">
            {entry.categories.map((category) => (
              <Link key={category.slug} className="chip" href={`/magazin/thema/${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rich-content">
        <div dangerouslySetInnerHTML={{ __html: entry.content }} />
      </section>

      {authorProfile ? (
        <section className="content-section">
          <ExpertTrustCard
            profile={authorProfile}
            eyebrow={authorProfile.slug === "christian-m-haas" ? "Unser Datingexperte" : "Magazin-Autor"}
            title={
              authorProfile.slug === "christian-m-haas"
                ? "Hinter den Inhalten steht ein reales Profil mit Dating-Erfahrung, Tierliebe und langjähriger Magazinbegleitung."
                : `Dieser Beitrag wurde von ${authorProfile.name} für das Tier-Magazin zusammengestellt.`
            }
            primaryLabel={authorProfile.slug === "christian-m-haas" ? "Zum Expertenprofil" : "Zum Autorenprofil"}
          />
        </section>
      ) : null}
    </main>
  );
}
