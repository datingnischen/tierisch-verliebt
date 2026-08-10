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

function isBreedProfile(html: string) {
  return /<p>\s*<strong>\s*Steckbrief\s*<\/strong>\s*<\/p>\s*<ul>/i.test(html);
}

function enhanceBreedContent(html: string) {
  return html.replace(/<p>\s*<strong>\s*Steckbrief\s*<\/strong>\s*<\/p>\s*(<ul>[\s\S]*?<\/ul>)/i, (_match, listHtml: string) => {
    const list = listHtml
      .replace(/^<ul>/i, '<ul class="breed-facts-list">')
      .replace(/<li>([\s\S]*?)<\/li>/gi, '<li><span class="breed-facts-paw" aria-hidden="true">🐾</span><span class="breed-facts-copy">$1</span></li>');

    return [
      '<section class="breed-facts-card">',
      '  <div class="breed-facts-header">',
      '    <span class="eyebrow eyebrow-brand">Steckbrief</span>',
      '    <h2>Steckbrief auf einen Blick</h2>',
      '    <p>Die wichtigsten Rassemerkmale kompakt zusammengefasst — warm, schnell erfassbar und mit etwas mehr Charakter als eine einfache Standardliste.</p>',
      '  </div>',
      `  ${list}`,
      '</section>',
    ].join('');
  });
}

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
  const breedPage = isBreedProfile(entry.content);
  const renderedContent = breedPage ? enhanceBreedContent(entry.content) : entry.content;

  return (
    <main className={`shell shell-narrow magazine-detail-shell${breedPage ? " breed-detail-shell" : ""}`}>
      <section className={`hero-card hero-magazine${breedPage ? " hero-magazine-breed" : ""}`}>
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
        <section className={`content-section${breedPage ? " content-section-featured" : ""}`}>
          <figure className={`article-hero-media${breedPage ? " article-hero-media-breed" : ""}`}>
            <img src={entry.featuredImage} alt={entry.featuredImageAlt || entry.title} loading="eager" decoding="async" />
          </figure>
        </section>
      ) : null}

      {entry.categories.length ? (
        <section className={`content-section${breedPage ? " content-section-tight" : ""}`}>
          <div className="chip-row">
            {entry.categories.map((category) => (
              <Link key={category.slug} className="chip" href={`/magazin/thema/${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className={`rich-content${breedPage ? " breed-rich-content" : ""}`}>
        <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
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
