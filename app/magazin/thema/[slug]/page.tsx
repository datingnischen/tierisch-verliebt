import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL, getMagazineCategories, getMagazineCategoryBySlug, getMagazinePostsByCategory, stripHtml } from "@/lib/wordpress";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getMagazineCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getMagazineCategoryBySlug(slug);
  if (!category) return {};

  const description =
    stripHtml(category.description).slice(0, 155) ||
    `${category.name} im Tier-Magazin von tierisch-verliebt.de – mit Artikeln, Tipps und passenden Einstiegen.`;

  return {
    title: category.name,
    description,
    alternates: {
      canonical: `${SITE_URL}/magazin/thema/${slug}`,
    },
    openGraph: {
      title: category.name,
      description,
      url: `${SITE_URL}/magazin/thema/${slug}`,
    },
  };
}

export default async function MagazineCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getMagazineCategoryBySlug(slug);
  if (!category) notFound();

  const posts = await getMagazinePostsByCategory(category.id);
  const intro =
    stripHtml(category.description) ||
    `Hier findest du Artikel, Ratgeber und praktische Einstiege rund um ${category.name.toLowerCase()} – passend für tierliebe Singles und Haustiermenschen.`;

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-brand">
        <span className="eyebrow">Magazin-Thema</span>
        <h1>{category.name}</h1>
        <p>{intro}</p>
        <div className="button-row">
          <Link className="button button-primary" href="https://tierisch-verliebt.de/?AID=magazin">
            Kostenlos registrieren
          </Link>
          <Link className="button button-secondary" href="/magazin">
            Zur Magazin-Übersicht
          </Link>
        </div>
      </section>

      <section className="content-section">
        <article className="panel-card">
          <div className="section-header">
            <span className="eyebrow">Schneller Einstieg</span>
            <h2>Worum es in diesem Themenbereich geht</h2>
          </div>
          <p>
            Ob praktische Tierfragen, gemeinsame Interessen oder Gesprächsstoff für neue Kontakte: Diese Rubrik bündelt
            passende Magazin-Inhalte für Menschen, bei denen Tiere zum Alltag gehören.
          </p>
          <div className="chip-row">
            <Link className="chip" href="/magazin">
              Alle Magazin-Themen
            </Link>
            <Link className="chip" href="/magazin/christian">
              Unser Datingexperte
            </Link>
            <Link className="chip" href="https://tierisch-verliebt.de/?AID=magazin">
              Kostenlos starten
            </Link>
          </div>
        </article>
      </section>

      <section className="content-section">
        <div className="section-header">
          <span className="eyebrow">Aktuelle Beiträge</span>
          <h2>Passende Artikel aus {category.name}</h2>
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
      </section>
    </main>
  );
}
