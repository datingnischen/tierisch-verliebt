import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMagazineCategories, getMagazineCategoryBySlug, getMagazinePostsByCategory, stripHtml } from "@/lib/wordpress";

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

  return {
    title: `${category.name} | tierisch-verliebt.de`,
    description: stripHtml(category.description).slice(0, 155) || `${category.name} im Tier-Magazin von tierisch-verliebt.de.`,
  };
}

export default async function MagazineCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getMagazineCategoryBySlug(slug);
  if (!category) notFound();

  const posts = await getMagazinePostsByCategory(category.id);

  return (
    <main className="shell shell-narrow">
      <section className="hero-card hero-brand">
        <span className="eyebrow">Magazin-Thema</span>
        <h1>{category.name}</h1>
        <p>
          {stripHtml(category.description) ||
            `Hier findest du aktuelle Beiträge, Einordnungen und tierliebe Ratgeber rund um ${category.name.toLowerCase()}.`}
        </p>
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
        <div className="section-header">
          <span className="eyebrow">Aktuelle Beiträge</span>
          <h2>{posts.length} passende Artikel</h2>
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
