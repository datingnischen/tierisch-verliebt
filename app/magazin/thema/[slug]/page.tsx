import type { Metadata } from "next";
import Link from "@/components/link";
import { notFound } from "next/navigation";
import { serializeJsonLd } from "@/lib/json-ld";
import {
  SITE_URL,
  formatUpdatedDate,
  getEntryUpdatedDate,
  getEntryCoverImage,
  getMagazineCategories,
  getMagazineCategoryBySlug,
  getMagazinePostsByCategory,
  getReadingMinutes,
  stripHtml,
  type MagazineEntry,
} from "@/lib/wordpress";
import { display } from "@/components/city-page/display-font";
import { ClockIcon, HeartIcon, PawIcon } from "@/components/city-page/tier-icons";
import { MagazineCategoryIcon } from "@/components/magazine-category-icon";
import "@/components/city-page/tier-city-page.css";
import "@/components/city-page/tier-city-hub.css";
import "../../magazin-hub.css";
import "./thema.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

const REGISTER_URL = "https://tierisch-verliebt.de/?AID=magazin";

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
      canonical: `${SITE_URL}/magazin/thema/${slug}/`,
    },
    openGraph: {
      title: category.name,
      description,
      url: `${SITE_URL}/magazin/thema/${slug}/`,
    },
  };
}

export default async function MagazineCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getMagazineCategoryBySlug(slug);
  if (!category) notFound();

  const [posts, categories] = await Promise.all([getMagazinePostsByCategory(category.id), getMagazineCategories()]);
  const pageUrl = `${SITE_URL}/magazin/thema/${slug}/`;
  const intro =
    stripHtml(category.description) ||
    `Hier findest du Artikel, Ratgeber und praktische Einstiege im Thema „${category.name}“ – passend für tierliebe Singles und Haustiermenschen.`;
  const [featured, ...rest] = posts;
  const latestUpdate = posts
    .map((post) => getEntryUpdatedDate(post))
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);
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
            url: `${SITE_URL}/magazin/${post.slug}/`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Magazin", item: `${SITE_URL}/magazin/` },
          { "@type": "ListItem", position: 2, name: category.name, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main className={`tvc tvm ${display.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(pageGraph) }} />

      <section className="tvc-hero tvh-hero tvm-hero">
        <div className="tvc-wrap tvm-hero-grid">
          <div className="tvc-hero-copy">
            <nav className="tvc-crumbs" aria-label="Brotkrumen">
              <Link href="/">Start</Link>
              <span aria-hidden="true">›</span>
              <Link href="/magazin">Magazin</Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{category.name}</span>
            </nav>
            <span className="tvc-badge">
              <span className="tvm-badge-icon" aria-hidden="true"><MagazineCategoryIcon slug={slug} /></span>
              Magazin-Thema
            </span>
            <h1>{category.name}</h1>
            <p className="tvc-lead">{intro}</p>
            <ul className="tvh-stats" aria-label={`${category.name} in Zahlen`}>
              <li><strong>{posts.length}</strong><span>Artikel</span></li>
              {latestUpdate ? (
                <li>
                  <strong>{new Intl.DateTimeFormat("de-DE", { month: "short", year: "numeric" }).format(new Date(latestUpdate))}</strong>
                  <span>Zuletzt aktualisiert</span>
                </li>
              ) : null}
              <li><strong>0 €</strong><span>Zum Start</span></li>
            </ul>
            <div className="tvc-actions">
              <a className="tvc-btn tvc-btn-primary" href="#artikel">Artikel entdecken</a>
              <Link className="tvc-btn tvc-btn-ghost" href={REGISTER_URL}>Kostenlos registrieren</Link>
            </div>
          </div>

          {featured ? (
            <Link className="tvm-feature" href={`/magazin/${featured.slug}`}>
              <span className="tvm-feature-pin" aria-hidden="true"><HeartIcon /></span>
              {getEntryCoverImage(featured) ? (
                <span className="tvm-feature-media"><CoverImage post={featured} eager /></span>
              ) : null}
              <span className="tvm-feature-body">
                <span className="tvm-kicker">Neuester Artikel</span>
                <strong>{featured.title}</strong>
                <span className="tvm-feature-excerpt">{teaser(featured, 130)}</span>
                <span className="tvm-feature-meta">
                  <span>{getReadingMinutes(featured.content)} Min. Lesezeit</span>
                  <span className="tvm-go">Jetzt lesen <span aria-hidden="true">→</span></span>
                </span>
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      {otherTopics.length > 1 ? (
        <nav className="tvc-wrap tvm-topics tvm-topics-flat" aria-label="Weitere Magazin-Themen">
          {otherTopics.map((item) => (
            <Link
              key={item.slug}
              href={`/magazin/thema/${item.slug}`}
              className={`tvm-topic${item.slug === slug ? " tvm-topic-index" : ""}`}
              aria-current={item.slug === slug ? "page" : undefined}
            >
              <span className="tvm-topic-icon" aria-hidden="true"><MagazineCategoryIcon slug={item.slug} /></span>
              <span><strong>{item.name}</strong><small>{item.count} {item.count === 1 ? "Beitrag" : "Beiträge"}</small></span>
            </Link>
          ))}
        </nav>
      ) : null}

      <section id="artikel" className="tvc-wrap tvm-section" aria-labelledby="thema-artikel-titel">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Alle Artikel</span>
          <h2 id="thema-artikel-titel">Lesestoff rund um {category.name}</h2>
        </div>
        {!featured ? <p className="thema-empty">In diesem Thema erscheinen bald die ersten Artikel.</p> : null}
        {rest.length ? (
          <ul className="tvm-posts">
            {rest.map((post) => (
              <li key={post.id}>
                <Link className="tvh-card tvm-post" href={`/magazin/${post.slug}`}>
                  <span className="tvh-card-media"><CoverImage post={post} /></span>
                  <span className="tvh-card-body">
                    <strong>{post.title}</strong>
                    <span className="tvm-post-excerpt">{teaser(post, 120)}</span>
                    <span className="tvm-post-date">
                      <ClockIcon />
                      {getEntryUpdatedDate(post) ? `${formatUpdatedDate(post)} · ` : ""}{getReadingMinutes(post.content)} Min.
                    </span>
                    <span className="tvh-card-go">Weiterlesen <span aria-hidden="true">→</span></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="tvc-wrap">
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
      </div>
    </main>
  );
}

function CoverImage({ post, eager = false }: { post: MagazineEntry; eager?: boolean }) {
  const src = getEntryCoverImage(post);
  if (!src) return <PawIcon />;
  return <img src={src} alt={post.featuredImageAlt || post.title} loading={eager ? "eager" : "lazy"} decoding="async" />;
}
