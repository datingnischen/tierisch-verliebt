import Link from "next/link";
import { getMagazineCategories, getMagazinePages, getMagazinePosts, stripHtml } from "@/lib/wordpress";

export const revalidate = 300;

export default async function MagazineOverviewPage() {
  const [posts, pages, categories] = await Promise.all([
    getMagazinePosts(),
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
          Hunde, Katzen und weitere Tierwelten treffen hier auf Ratgeber, Magazineinstiege und eine klare,
          vertrauensvolle Oberfläche statt eines nackten Imports.
        </p>
        <div className="button-row">
          <Link className="button button-primary" href="https://tierisch-verliebt.de/?AID=magazin">
            Kostenlos registrieren
          </Link>
          <Link className="button button-secondary" href="/magazin/ueber-uns">
            Unsere Geschichte
          </Link>
        </div>
      </section>

      {featuredPost ? (
        <section className="content-section">
          <article className="editorial-feature-card">
            {featuredPost.featuredImage ? (
              <div className="editorial-feature-media">
                <img src={featuredPost.featuredImage} alt={featuredPost.featuredImageAlt || featuredPost.title} loading="eager" decoding="async" />
              </div>
            ) : null}
            <div className="editorial-feature-copy">
              <span className="eyebrow eyebrow-muted">Gerade beliebt</span>
              <h3>{featuredPost.title}</h3>
              <p>{stripHtml(featuredPost.excerpt || featuredPost.content).slice(0, 220)}…</p>
              <div className="meta-row">
                {featuredPost.authorName ? <span>Von {featuredPost.authorName}</span> : null}
                {featuredPost.date ? <span>{featuredPost.date.slice(0, 10)}</span> : null}
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
            <h2>Aktuelle Artikel</h2>
          </div>
          <div className="stack-list">
            {posts.slice(0, 8).map((post) => (
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
        </article>

        <article className="panel-card">
          <div className="section-header">
            <span className="eyebrow">Wichtige Seiten</span>
            <h2>Evergreen- und Info-Seiten</h2>
          </div>
          <div className="stack-list">
            {pages.slice(0, 8).map((page) => (
              <Link key={page.id} href={`/magazin/${page.slug}`} className="article-card">
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
