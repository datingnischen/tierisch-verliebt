import type { Metadata } from "next";
import Link from "next/link";
import { canonicalMagazinePagePath } from "@/lib/about-section";
import {
  MAGAZINE_POSTS_PER_PAGE,
  SITE_URL,
  formatGermanDate,
  getMagazineCategories,
  getMagazinePages,
  getMagazinePostsPage,
  stripHtml,
} from "@/lib/wordpress";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tier-Magazin für tierliebe Singles",
  description:
    "Entdecke Magazin-Inhalte rund um Hund, Katze und weitere Tierwelten – mit klaren Einstiegen, echten Autoren und direktem Weg zur tierlieben Partnersuche.",
  alternates: {
    canonical: `${SITE_URL}/magazin`,
  },
  openGraph: {
    title: "Tier-Magazin für tierliebe Singles",
    description:
      "Entdecke Magazin-Inhalte rund um Hund, Katze und weitere Tierwelten – mit klaren Einstiegen, echten Autoren und direktem Weg zur tierlieben Partnersuche.",
    url: `${SITE_URL}/magazin`,
  },
};

export default async function MagazineOverviewPage() {
  const [{ posts, totalPages, totalItems }, pages, categories] = await Promise.all([
    getMagazinePostsPage(1, MAGAZINE_POSTS_PER_PAGE),
    getMagazinePages(),
    getMagazineCategories(),
  ]);

  const featuredPost = posts[0];

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-brand">
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
          <article className="editorial-feature-card">
            {featuredPost.featuredImage ? (
              <div className="editorial-feature-media">
                <img
                  src={featuredPost.featuredImage}
                  alt={featuredPost.featuredImageAlt || featuredPost.title}
                  loading="eager"
                  decoding="async"
                />
              </div>
            ) : null}
            <div className="editorial-feature-copy">
              <span className="eyebrow eyebrow-muted">Gerade beliebt</span>
              <h3>{featuredPost.title}</h3>
              <p>{stripHtml(featuredPost.excerpt || featuredPost.content).slice(0, 220)}…</p>
              <div className="meta-row">
                {featuredPost.authorName ? <span>Von {featuredPost.authorName}</span> : null}
                {featuredPost.date ? <span>{formatGermanDate(featuredPost.date)}</span> : null}
              </div>
              <Link className="button button-primary" href={`/magazin/${featuredPost.slug}`}>
                Jetzt lesen
              </Link>
            </div>
          </article>
        </section>
      ) : null}

      <section className="content-section">
        <div className="section-header">
          <span className="eyebrow">Beliebte Kategorien</span>
          <h2>Magazin-Themen mit direktem Einstieg</h2>
        </div>
        <div className="chip-row">
          {categories.slice(0, 8).map((category) => (
            <Link key={category.slug} className="chip" href={`/magazin/thema/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid-two">
        <article className="panel-card">
          <div className="section-header">
            <span className="eyebrow">Neueste Beiträge</span>
            <h2>Aktuelle Artikel im Überblick</h2>
          </div>
          <div className="stack-list">
            {posts.map((post) => (
              <Link key={post.id} href={`/magazin/${post.slug}`} className="article-card article-card-rich">
                {post.featuredImage ? (
                  <div className="article-card-media">
                    <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} loading="lazy" decoding="async" />
                  </div>
                ) : null}
                <div className="article-card-copy">
                  <h3>{post.title}</h3>
                  <p>{stripHtml(post.excerpt || post.content).slice(0, 160)}…</p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="pagination-bar" aria-label="Seitennavigation Magazin">
              <span>
                Seite 1 von {totalPages} · {totalItems} Beiträge
              </span>
              <div className="pagination-actions">
                <Link className="button button-secondary" href="/magazin/page/2">
                  Ältere Beiträge
                </Link>
              </div>
            </div>
          ) : null}
        </article>

        <article className="panel-card">
          <div className="section-header">
            <span className="eyebrow">Wichtige Seiten</span>
            <h2>Evergreen- und Info-Seiten</h2>
          </div>
          <div className="stack-list">
            {pages.slice(0, 8).map((page) => (
              <Link key={page.id} href={canonicalMagazinePagePath(page.slug)} className="article-card">
                <h3>{page.title}</h3>
                <p>{stripHtml(page.excerpt || page.content).slice(0, 150)}…</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
