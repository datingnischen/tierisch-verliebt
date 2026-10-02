import type { Metadata } from "next";
import Link from "@/components/link";
import { notFound, redirect } from "next/navigation";
import { MAGAZINE_POSTS_PER_PAGE, SITE_URL, formatUpdatedDate, getMagazinePostsPage, stripHtml } from "@/lib/magazine";
import { display } from "@/components/city-page/display-font";
import { ClockIcon, PawIcon } from "@/components/city-page/tier-icons";
import { MagazineCategoryIcon } from "@/components/magazine-category-icon";
import "@/components/city-page/tier-city-page.css";
import "@/components/city-page/tier-city-hub.css";
import "../../magazin-hub.css";

type PageProps = {
  params: Promise<{ page: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const { totalPages } = await getMagazinePostsPage(1, MAGAZINE_POSTS_PER_PAGE);
  // Seite 1 leitet auf /magazin um und wird mit gebaut, damit die Umleitung bestehen bleibt.
  return Array.from({ length: totalPages }, (_, index) => ({ page: String(index + 1) }));
}

function excerpt(text: string, length: number) {
  const plain = stripHtml(text);
  return plain.length > length ? `${plain.slice(0, length).replace(/\s+\S*$/, "")} …` : plain;
}

/** Seitenzahlen rund um die aktuelle Seite, Lücken als null (… in der Leiste). */
function pageWindow(current: number, total: number) {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | null)[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push(null);
    result.push(page);
  });
  return result;
}

const pageHref = (page: number) => (page === 1 ? "/magazin" : `/magazin/page/${page}`);

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
      alternates: { canonical: `${SITE_URL}/magazin/` },
    };
  }

  return {
    title: `Tier-Magazin – Seite ${pageNumber}`,
    description: `Weitere Magazin-Beiträge und Tierwelten für tierliebe Singles auf Seite ${pageNumber}.`,
    alternates: {
      canonical: `${SITE_URL}/magazin/page/${pageNumber}/`,
    },
    openGraph: {
      title: `Tier-Magazin – Seite ${pageNumber}`,
      description: `Weitere Magazin-Beiträge und Tierwelten für tierliebe Singles auf Seite ${pageNumber}.`,
      url: `${SITE_URL}/magazin/page/${pageNumber}/`,
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
    <main className={`tvc tvm ${display.variable}`}>
      <section className="tvc-hero tvh-hero tvm-hero tvm-hero-compact">
        <div className="tvc-wrap">
          <div className="tvc-hero-copy">
            <nav className="tvc-crumbs" aria-label="Brotkrumen">
              <Link href="/">Start</Link>
              <span aria-hidden="true">›</span>
              <Link href="/magazin">Magazin</Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Seite {pageNumber}</span>
            </nav>
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />Tier-Magazin · Seite {pageNumber} von {totalPages}</span>
            <h1>Weitere Magazin-Beiträge</h1>
            <p className="tvc-lead">
              Hier findest du weitere Artikel, Geschichten und Ratgeber aus dem Magazin – ideal zum Stöbern nach Hunde-,
              Katzen- und Tierwelten-Themen.
            </p>
            <ul className="tvh-stats">
              <li><strong>{totalItems}</strong><span>Beiträge</span></li>
              <li><strong>{pageNumber}/{totalPages}</strong><span>Seite</span></li>
            </ul>
            <div className="tvc-actions">
              <Link className="tvc-btn tvc-btn-primary" href="https://tierisch-verliebt.de/?AID=magazin">Kostenlos registrieren</Link>
              <Link className="tvc-btn tvc-btn-ghost" href="/magazin/inhalt">Alles von A–Z</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="tvc-wrap tvm-section tvm-section-first" aria-labelledby="tvm-page-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Seite {pageNumber}</span>
          <h2 id="tvm-page-title">Weitere aktuelle Artikel</h2>
        </div>
        <ul className="tvm-posts">
          {posts.map((post) => (
            <li key={post.id}>
              <Link className="tvh-card tvm-post" href={`/magazin/${post.slug}`}>
                <span className="tvh-card-media">
                  {post.featuredImage ? <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} loading="lazy" decoding="async" /> : <PawIcon />}
                  {post.categories[0] ? <span className="tvh-card-region"><MagazineCategoryIcon slug={post.categories[0].slug} />{post.categories[0].name}</span> : null}
                </span>
                <span className="tvh-card-body">
                  <strong>{post.title}</strong>
                  <span className="tvm-post-excerpt">{excerpt(post.excerpt || post.content, 120)}</span>
                  {formatUpdatedDate(post) ? <span className="tvm-post-date"><ClockIcon />{formatUpdatedDate(post)}</span> : null}
                  <span className="tvh-card-go">Weiterlesen <span aria-hidden="true">→</span></span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <nav className="tvm-pager" aria-label="Seitennavigation Magazin">
          {pageNumber > 1 ? <Link className="tvm-pager-step" href={pageHref(pageNumber - 1)}>← Neuere Beiträge</Link> : <span />}
          <ol className="tvm-pager-pages">
            {pageWindow(pageNumber, totalPages).map((page, index) =>
              page === null ? (
                <li key={`gap-${index}`} aria-hidden="true">…</li>
              ) : (
                <li key={page}>
                  {page === pageNumber ? (
                    <span aria-current="page">{page}</span>
                  ) : (
                    <Link href={pageHref(page)} aria-label={`Seite ${page}`}>{page}</Link>
                  )}
                </li>
              ),
            )}
          </ol>
          {pageNumber < totalPages ? <Link className="tvm-pager-step tvm-pager-next" href={pageHref(pageNumber + 1)}>Ältere Beiträge →</Link> : <span />}
        </nav>
      </section>
    </main>
  );
}
