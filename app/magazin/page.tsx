import type { Metadata } from "next";
import Link from "@/components/link";
import { magazineTopicEmoji } from "@/lib/magazine-index";
import {
  MAGAZINE_POSTS_PER_PAGE,
  SITE_URL,
  formatUpdatedDate,
  getMagazineCategories,
  getMagazinePages,
  getMagazinePostsPage,
  stripHtml,
} from "@/lib/wordpress";

export const revalidate = 300;

type EntryPoint = {
  slug: string;
  href: string;
  label: string;
  teaser: string;
  emoji: string;
  wide?: boolean;
};

// Kuratierte Einstiege statt alphabetischer Seitenliste; Bilder kommen aus den WordPress-Seiten.
const MAGAZINE_ENTRY_POINTS: EntryPoint[] = [
  {
    slug: "hunderassen",
    href: "/magazin/hunderassen",
    label: "Hunderassen",
    teaser: "Rassenporträts von Akita Inu bis Zwergspitz",
    emoji: "🐕",
    wide: true,
  },
  {
    slug: "katzenrassen",
    href: "/magazin/katzenrassen",
    label: "Katzenrassen",
    teaser: "Von Maine Coon bis Sphynx",
    emoji: "🐈",
  },
  {
    slug: "voegel-uebersicht",
    href: "/magazin/voegel-uebersicht",
    label: "Vögel",
    teaser: "Wellensittich & Co. artgerecht halten",
    emoji: "🦜",
  },
  {
    slug: "tierwelten",
    href: "/magazin/tierwelten",
    label: "Unsere Tierwelten",
    teaser: "Hund, Katze, Vogel und Kleintier im Überblick",
    emoji: "🐾",
    wide: true,
  },
  {
    slug: "kleintiere",
    href: "/magazin/kleintiere",
    label: "Kleintiere",
    teaser: "Kaninchen, Hamster, Meerschweinchen",
    emoji: "🐹",
  },
  {
    slug: "fci-gruppen",
    href: "/magazin/fci-gruppen",
    label: "FCI-Gruppen",
    teaser: "So werden Hunderassen eingeteilt",
    emoji: "📋",
  },
];

export const metadata: Metadata = {
  title: "Tier-Magazin für tierliebe Singles",
  description:
    "Entdecke Magazin-Inhalte rund um Hund, Katze und weitere Tierwelten – mit klaren Einstiegen, echten Autoren und direktem Weg zur tierlieben Partnersuche.",
  alternates: {
    canonical: `${SITE_URL}/magazin/`,
  },
  openGraph: {
    title: "Tier-Magazin für tierliebe Singles",
    description:
      "Entdecke Magazin-Inhalte rund um Hund, Katze und weitere Tierwelten – mit klaren Einstiegen, echten Autoren und direktem Weg zur tierlieben Partnersuche.",
    url: `${SITE_URL}/magazin/`,
  },
};

export default async function MagazineOverviewPage() {
  const [{ posts, totalPages, totalItems }, pages, categories] = await Promise.all([
    getMagazinePostsPage(1, MAGAZINE_POSTS_PER_PAGE),
    getMagazinePages(),
    getMagazineCategories(),
  ]);

  const featuredPost = posts[0];
  const latestPosts = posts.slice(0, 3);
  const pagesBySlug = new Map(pages.map((page) => [page.slug, page]));
  const entryPoints = MAGAZINE_ENTRY_POINTS.map((entry) => ({
    ...entry,
    image: pagesBySlug.get(entry.slug)?.featuredImage || "",
  }));

  return (
    <main className="shell shell-narrow magazine-overview-page">
      <section className="hero-card hero-brand hero-brand-magazine">
        <span className="eyebrow">Tier-Magazin</span>
        <h1>Tierwissen, tierliebe Geschichten und Magazin-Inhalte für Singles mit Herz für Tiere.</h1>
        <p>
          Entdecke Ratgeber, Tierwelten und echte Geschichten rund um Hund, Katze und weitere Haustier-Themen — mit
          klaren Einstiegen, echten Autorenprofilen und direktem Weg zur Anmeldung.
        </p>
        <div className="button-row">
          <Link className="button button-primary" href="https://tierisch-verliebt.de/?AID=magazin">
            Kostenlos registrieren
          </Link>
          <Link className="button button-secondary" href="/ueber-uns">
            Über uns
          </Link>
        </div>
      </section>

      {featuredPost ? (
        <section className="content-section">
          <article className="editorial-feature-card editorial-feature-card-magazine">
            {featuredPost.featuredImage ? (
              <div className="editorial-feature-media editorial-feature-media-magazine">
                <img
                  src={featuredPost.featuredImage}
                  alt={featuredPost.featuredImageAlt || featuredPost.title}
                  loading="eager"
                  decoding="async"
                />
              </div>
            ) : null}
            <div className="editorial-feature-copy editorial-feature-copy-magazine">
              <span className="eyebrow eyebrow-muted">Gerade beliebt</span>
              <h2>{featuredPost.title}</h2>
              <p>{stripHtml(featuredPost.excerpt || featuredPost.content).slice(0, 220)}…</p>
              <div className="meta-row editorial-feature-meta">
                {featuredPost.authorName ? <span>Von {featuredPost.authorName}</span> : null}
                {formatUpdatedDate(featuredPost) ? <span>{formatUpdatedDate(featuredPost)}</span> : null}
              </div>
              <div className="button-row">
                <Link className="button button-primary" href={`/magazin/${featuredPost.slug}`}>
                  Jetzt lesen
                </Link>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      <section className="content-section content-section-tight magazine-category-section">
        <div className="section-header magazine-category-header">
          <div>
            <span className="eyebrow">Beliebte Kategorien</span>
            <h2>Magazin-Themen mit direktem Einstieg</h2>
            <p>Schnelle Wege zu Hund, Katze, Vögeln, Apps und weiteren Themen, die Tierfreunde gerade besonders interessieren.</p>
          </div>
        </div>
        <div className="magazine-topic-grid">
          <Link className="magazine-topic-card magazine-topic-card-index" href="/magazin/inhalt">
            <span className="magazine-topic-icon" aria-hidden="true">
              📚
            </span>
            <span className="magazine-topic-copy">
              <strong>Inhaltsverzeichnis: alle Beiträge &amp; Seiten A–Z</strong>
              <small>Hunderassen, Katzenrassen, Ratgeber und mehr – durchsuchbar auf einer Seite</small>
            </span>
            <span className="magazine-topic-arrow" aria-hidden="true">
              →
            </span>
          </Link>
          {categories.slice(0, 8).map((category) => (
            <Link key={category.slug} className="magazine-topic-card" href={`/magazin/thema/${category.slug}`}>
              <span className="magazine-topic-icon" aria-hidden="true">
                {magazineTopicEmoji(category.slug)}
              </span>
              <span className="magazine-topic-copy">
                <strong>{category.name}</strong>
                {category.count > 0 ? (
                  <small>
                    {category.count} {category.count === 1 ? "Beitrag" : "Beiträge"}
                  </small>
                ) : null}
              </span>
              <span className="magazine-topic-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid-two magazine-overview-grid">
        <article className="panel-card panel-card-magazine-main">
          <div className="section-header">
            <span className="eyebrow">Neueste Beiträge</span>
            <h2>Aktuelle Artikel im Überblick</h2>
            <p>Die wichtigsten frischen Themen mit mehr Luft, klarerer Hierarchie und direktem Einstieg ins Magazin.</p>
          </div>
          <div className="stack-list magazine-overview-posts">
            {latestPosts.map((post) => (
              <Link key={post.id} href={`/magazin/${post.slug}`} className="article-card article-card-rich article-card-rich-magazine">
                {post.featuredImage ? (
                  <div className="article-card-media article-card-media-magazine">
                    <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} loading="lazy" decoding="async" />
                  </div>
                ) : null}
                <div className="article-card-copy article-card-copy-magazine">
                  <div className="meta-row article-card-meta-magazine">
                    {post.categories[0] ? <span>{post.categories[0].name}</span> : null}
                    {formatUpdatedDate(post) ? <span>{formatUpdatedDate(post)}</span> : null}
                  </div>
                  <h3>{post.title}</h3>
                  <p>{stripHtml(post.excerpt || post.content).slice(0, 170)}…</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="pagination-bar pagination-bar-magazine">
            <span>
              Seite 1 von {totalPages} · {totalItems} Beiträge
            </span>
            <div className="pagination-actions">
              <Link className="button button-secondary" href={totalPages > 1 ? "/magazin/page/2" : "/magazin"}>
                {totalPages > 1 ? "Ältere Beiträge" : "Zum Magazin"}
              </Link>
            </div>
          </div>
        </article>

        <article className="panel-card panel-card-magazine-side">
          <div className="section-header">
            <span className="eyebrow">Wichtige Einstiege</span>
            <h2>Hier startest du am besten</h2>
            <p>Die großen Ratgeber-Bereiche des Magazins – von Hunderassen bis Kleintiere.</p>
          </div>
          <div className="entry-point-grid">
            {entryPoints.map((entry) => (
              <Link
                key={entry.slug}
                href={entry.href}
                className={[
                  "entry-point-card",
                  entry.image ? "entry-point-card-image" : "entry-point-card-plain",
                  entry.wide ? "entry-point-card-wide" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {entry.image ? (
                  <img className="entry-point-media" src={entry.image} alt="" loading="lazy" decoding="async" />
                ) : null}
                <span className="entry-point-emoji" aria-hidden="true">
                  {entry.emoji}
                </span>
                <span className="entry-point-copy">
                  <strong>{entry.label}</strong>
                  <small>{entry.teaser}</small>
                </span>
                <span className="entry-point-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
          <Link className="entry-point-more" href="/magazin/inhalt">
            <span aria-hidden="true">📚</span> Alle Beiträge &amp; Seiten von A–Z
            <span className="entry-point-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </article>
      </section>
    </main>
  );
}
