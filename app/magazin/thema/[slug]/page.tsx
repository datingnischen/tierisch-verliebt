import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serializeJsonLd } from "@/lib/json-ld";
import {
  SITE_URL,
  formatGermanDate,
  getEntryCoverImage,
  getMagazineCategories,
  getMagazineCategoryBySlug,
  getMagazinePostsByCategory,
  getReadingMinutes,
  stripHtml,
  type MagazineEntry,
} from "@/lib/wordpress";
import "./thema.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

const REGISTER_URL = "https://tierisch-verliebt.de/?AID=magazin";

const TOPIC_EMOJI: Record<string, string> = {
  apps: "📱",
  "ratgeber-hund": "🐶",
  "ratgeber-katze": "🐱",
  "ratgeber-voegel": "🦜",
  presse: "📰",
};

function topicEmoji(slug: string) {
  return TOPIC_EMOJI[slug] ?? "🐾";
}

function teaser(post: MagazineEntry, length: number) {
  const text = stripHtml(post.excerpt || post.content);
  return text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, "")} …` : text;
}

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

  const [posts, categories] = await Promise.all([getMagazinePostsByCategory(category.id), getMagazineCategories()]);
  const pageUrl = `${SITE_URL}/magazin/thema/${slug}`;
  const emoji = topicEmoji(slug);
  const intro =
    stripHtml(category.description) ||
    `Hier findest du Artikel, Ratgeber und praktische Einstiege rund um ${category.name.toLowerCase()} – passend für tierliebe Singles und Haustiermenschen.`;
  const [featured, ...rest] = posts;
  const latestDate = posts.find((post) => post.modified || post.date);
  const otherTopics = categories.filter((item) => item.count > 0);

  const pageGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: category.name,
        description: intro,
        inLanguage: "de-DE",
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: posts.length,
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: post.title,
            url: `${SITE_URL}/magazin/${post.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Magazin", item: `${SITE_URL}/magazin` },
          { "@type": "ListItem", position: 2, name: category.name, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main className="shell thema-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageGraph) }} />

      <nav className="thema-breadcrumb" aria-label="Brotkrumen">
        <Link href="/magazin">Magazin</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{category.name}</span>
      </nav>

      <section className="thema-hero" data-emoji={emoji}>
        <div className="thema-hero-copy">
          <span className="eyebrow">
            <span aria-hidden="true">{emoji}</span> Magazin-Thema
          </span>
          <h1>{category.name}</h1>
          <p>{intro}</p>
          <div className="button-row">
            <a className="button button-primary" href="#artikel">
              Artikel entdecken
            </a>
            <Link className="button button-secondary" href={REGISTER_URL}>
              Kostenlos registrieren
            </Link>
          </div>
        </div>
        <ul className="thema-hero-stats" aria-label={`${category.name} in Zahlen`}>
          <li>
            <strong>{posts.length}</strong>
            <span>Artikel</span>
          </li>
          {latestDate ? (
            <li>
              <strong>{formatGermanDate(latestDate.modified || latestDate.date).replace(/^\d+\.\s*/, "")}</strong>
              <span>Zuletzt aktualisiert</span>
            </li>
          ) : null}
          <li>
            <strong>0 €</strong>
            <span>Zum Start</span>
          </li>
        </ul>
      </section>

      {otherTopics.length > 1 ? (
        <nav className="thema-topic-nav" aria-label="Weitere Magazin-Themen">
          {otherTopics.map((item) => (
            <Link
              key={item.slug}
              href={`/magazin/thema/${item.slug}`}
              className={`thema-topic${item.slug === slug ? " is-active" : ""}`}
              aria-current={item.slug === slug ? "page" : undefined}
            >
              <span aria-hidden="true">{topicEmoji(item.slug)}</span>
              {item.name}
              <small>{item.count}</small>
            </Link>
          ))}
        </nav>
      ) : null}

      <section id="artikel" className="thema-articles" aria-labelledby="thema-artikel-titel">
        <header className="thema-section-header">
          <span className="eyebrow eyebrow-brand">Alle Artikel</span>
          <h2 id="thema-artikel-titel">Lesestoff rund um {category.name}</h2>
        </header>

        {featured ? (
          <article className="thema-featured">
            <Link href={`/magazin/${featured.slug}`} className="thema-card-media thema-featured-media" tabIndex={-1} aria-hidden="true">
              <CoverImage post={featured} emoji={emoji} eager />
            </Link>
            <div className="thema-featured-copy">
              <PostMeta post={featured} label="Neuester Artikel" />
              <h3>
                <Link href={`/magazin/${featured.slug}`}>{featured.title}</Link>
              </h3>
              <p>{teaser(featured, 260)}</p>
              <Link className="button button-primary thema-featured-cta" href={`/magazin/${featured.slug}`}>
                Jetzt lesen
              </Link>
            </div>
          </article>
        ) : (
          <p className="thema-empty">In diesem Thema erscheinen bald die ersten Artikel.</p>
        )}

        {rest.length ? (
          <div className="thema-grid">
            {rest.map((post) => (
              <article key={post.id} className="thema-card">
                <Link href={`/magazin/${post.slug}`} className="thema-card-media" tabIndex={-1} aria-hidden="true">
                  <CoverImage post={post} emoji={emoji} />
                </Link>
                <div className="thema-card-body">
                  <PostMeta post={post} />
                  <h3>
                    <Link href={`/magazin/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p>{teaser(post, 150)}</p>
                  <span className="thema-card-more" aria-hidden="true">
                    Weiterlesen →
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="thema-info">
        <div className="thema-info-copy">
          <span className="eyebrow eyebrow-muted">Worum es hier geht</span>
          <h2>Tiere verbinden – auch beim Kennenlernen</h2>
          <p>
            Ob praktische Tierfragen, gemeinsame Interessen oder Gesprächsstoff für neue Kontakte: Diese Rubrik bündelt
            passende Magazin-Inhalte für Menschen, bei denen Tiere zum Alltag gehören.
          </p>
        </div>
        <div className="thema-info-links">
          <Link className="thema-info-link" href="/magazin">
            <span aria-hidden="true">📚</span>
            <span>
              <strong>Alle Magazin-Themen</strong>
              <small>Zur Magazin-Übersicht</small>
            </span>
          </Link>
          <Link className="thema-info-link" href="/magazin/tierwelten">
            <span aria-hidden="true">🐾</span>
            <span>
              <strong>Tierwelten</strong>
              <small>Rassen, Haltung und Singles mit derselben Tierliebe</small>
            </span>
          </Link>
          <Link className="thema-info-link" href="/magazin/christian">
            <span aria-hidden="true">💬</span>
            <span>
              <strong>Unser Datingexperte</strong>
              <small>Christian M. Haas schreibt für das Magazin</small>
            </span>
          </Link>
        </div>
      </section>

      <section className="thema-cta">
        <div>
          <span className="eyebrow">Singlebörse</span>
          <h2>Lieber gemeinsam mit Tier als allein auf dem Sofa?</h2>
          <p>Lerne tierliebe Singles aus deiner Umgebung kennen – die Anmeldung ist kostenlos.</p>
        </div>
        <Link className="button button-primary" href={REGISTER_URL}>
          Kostenlos registrieren
        </Link>
      </section>
    </main>
  );
}

function CoverImage({ post, emoji, eager = false }: { post: MagazineEntry; emoji: string; eager?: boolean }) {
  const src = getEntryCoverImage(post);
  if (!src) return <span className="thema-card-fallback">{emoji}</span>;
  return <img src={src} alt={post.featuredImageAlt || post.title} loading={eager ? "eager" : "lazy"} decoding="async" />;
}

function PostMeta({ post, label }: { post: MagazineEntry; label?: string }) {
  return (
    <div className="thema-meta">
      {label ? <span className="thema-meta-label">{label}</span> : null}
      {post.date ? <time dateTime={post.date}>{formatGermanDate(post.date)}</time> : null}
      <span>{getReadingMinutes(post.content)} Min. Lesezeit</span>
    </div>
  );
}
