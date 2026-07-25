import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MAGAZINE_POSTS_PER_PAGE, SITE_URL, getMagazinePostsPage, stripHtml } from "@/lib/wordpress";

type PageProps = {
  params: Promise<{ page: string }>;
};

export const revalidate = 300;

function parsePageNumber(value: string) {
  const pageNumber = Number(value);
  return Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;
  const pageNumber = parsePageNumber(page);
  if (!pageNumber) return {};
  if (pageNumber === 1) {
    return {
      alternates: { canonical: `${SITE_URL}/magazin` },
    };
  }

  return {
    title: `Tier-Magazin – Seite ${pageNumber}`,
    description: `Weitere Magazin-Beiträge und Tierwelten für tierliebe Singles auf Seite ${pageNumber}.`,
    alternates: {
      canonical: `${SITE_URL}/magazin/page/${pageNumber}`,
    },
    openGraph: {
      title: `Tier-Magazin – Seite ${pageNumber}`,
      description: `Weitere Magazin-Beiträge und Tierwelten für tierliebe Singles auf Seite ${pageNumber}.`,
      url: `${SITE_URL}/magazin/page/${pageNumber}`,
    },
  };
}

export default async function MagazinePaginationPage({ params }: PageProps) {
  const { page } = await params;
  const pageNumber = parsePageNumber(page);
  if (!pageNumber) notFound();
  if (pageNumber === 1) redirect("/magazin");

  const { posts, totalPages, totalItems } = await getMagazinePostsPage(pageNumber, MAGAZINE_POSTS_PER_PAGE);
  if (!posts.length || pageNumber > totalPages) notFound();

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-brand">
        <span className="eyebrow">Tier-Magazin</span>
        <h1>Weitere Magazin-Beiträge für tierliebe Singles</h1>
        <p>
          Hier findest du weitere Artikel, Geschichten und Ratgeber aus dem Magazin — ideal zum Stöbern nach Hunde-,
          Katzen- und Tierwelten-Themen.
        </p>
        <div className="button-row">
          <Link className="button button-primary" href="https://tierisch-verliebt.de/?AID=magazin">
            Kostenlos registrieren
          </Link>
          <Link className="button button-secondary" href="/magazin">
            Zur ersten Magazin-Seite
          </Link>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <span className="eyebrow">Seite {pageNumber}</span>
          <h2>Weitere aktuelle Artikel</h2>
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
                <p>{stripHtml(post.excerpt || post.content).slice(0, 170)}…</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="pagination-bar" aria-label="Seitennavigation Magazin">
          <span>
            Seite {pageNumber} von {totalPages} · {totalItems} Beiträge
          </span>
          <div className="pagination-actions">
            {pageNumber > 2 ? (
              <Link className="button button-secondary" href={`/magazin/page/${pageNumber - 1}`}>
                Neuere Beiträge
              </Link>
            ) : pageNumber === 2 ? (
              <Link className="button button-secondary" href="/magazin">
                Neuere Beiträge
              </Link>
            ) : null}
            {pageNumber < totalPages ? (
              <Link className="button button-secondary" href={`/magazin/page/${pageNumber + 1}`}>
                Ältere Beiträge
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
