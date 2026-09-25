import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "@/components/link";
import { display } from "@/components/city-page/display-font";
import { BirdIcon, BunnyIcon, CatIcon, ClockIcon, DogIcon, HeartIcon, HorseIcon, PawIcon } from "@/components/city-page/tier-icons";
import {
  MAGAZINE_POSTS_PER_PAGE,
  SITE_URL,
  formatUpdatedDate,
  getMagazineCategories,
  getMagazinePages,
  getMagazinePostsPage,
  stripHtml,
} from "@/lib/wordpress";
import "@/components/city-page/tier-city-page.css";
import "@/components/city-page/tier-city-hub.css";
import "./magazin-hub.css";

export const revalidate = 300;

type EntryPoint = {
  slug: string;
  href: string;
  label: string;
  teaser: string;
  icon: ReactNode;
  size?: "big" | "banner";
};

// Kuratierte Einstiege statt alphabetischer Seitenliste; Bilder kommen aus den WordPress-Seiten.
const MAGAZINE_ENTRY_POINTS: EntryPoint[] = [
  { slug: "hunderassen", href: "/magazin/hunderassen", label: "Hunderassen", teaser: "Rassenporträts von Akita Inu bis Zwergspitz", icon: <DogIcon />, size: "big" },
  { slug: "katzenrassen", href: "/magazin/katzenrassen", label: "Katzenrassen", teaser: "Von Maine Coon bis Sphynx", icon: <CatIcon /> },
  { slug: "voegel-uebersicht", href: "/magazin/voegel-uebersicht", label: "Vögel", teaser: "Wellensittich & Co. artgerecht halten", icon: <BirdIcon /> },
  { slug: "kleintiere", href: "/magazin/kleintiere", label: "Kleintiere", teaser: "Kaninchen, Hamster, Meerschweinchen", icon: <BunnyIcon /> },
  { slug: "fci-gruppen", href: "/magazin/fci-gruppen", label: "FCI-Gruppen", teaser: "So werden Hunderassen eingeteilt", icon: <HorseIcon /> },
  { slug: "tierwelten", href: "/magazin/tierwelten", label: "Unsere Tierwelten", teaser: "Hund, Katze, Vogel und Kleintier im Überblick", icon: <PawIcon />, size: "banner" },
];

function categoryIcon(slug: string) {
  if (slug.includes("hund")) return <DogIcon />;
  if (slug.includes("katze")) return <CatIcon />;
  if (slug.includes("vogel") || slug.includes("voegel")) return <BirdIcon />;
  if (slug.includes("klein") || slug.includes("kaninchen")) return <BunnyIcon />;
  if (slug.includes("pferd")) return <HorseIcon />;
  if (slug.includes("allgemein") || slug.includes("dating")) return <HeartIcon />;
  return <PawIcon />;
}

function excerpt(text: string, length: number) {
  const plain = stripHtml(text);
  return plain.length > length ? `${plain.slice(0, length).replace(/\s+\S*$/, "")} …` : plain;
}

const DESCRIPTION =
  "Entdecke Magazin-Inhalte rund um Hund, Katze und weitere Tierwelten – mit klaren Einstiegen, echten Autoren und direktem Weg zur tierlieben Partnersuche.";

export const metadata: Metadata = {
  title: "Tier-Magazin für tierliebe Singles",
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/magazin/` },
  openGraph: { title: "Tier-Magazin für tierliebe Singles", description: DESCRIPTION, url: `${SITE_URL}/magazin/` },
};

export default async function MagazineOverviewPage() {
  const [{ posts, totalPages, totalItems }, pages, categories] = await Promise.all([
    getMagazinePostsPage(1, MAGAZINE_POSTS_PER_PAGE),
    getMagazinePages(),
    getMagazineCategories(),
  ]);

  const featuredPost = posts[0];
  const latestPosts = posts.slice(1, 7);
  const pagesBySlug = new Map(pages.map((page) => [page.slug, page]));
  const entryPoints = MAGAZINE_ENTRY_POINTS.map((entry) => ({ ...entry, image: pagesBySlug.get(entry.slug)?.featuredImage || "" }));

  return (
    <main className={`tvc tvm ${display.variable}`}>
      <section className="tvc-hero tvh-hero tvm-hero">
        <div className="tvc-wrap tvm-hero-grid">
          <div className="tvc-hero-copy">
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />Tier-Magazin</span>
            <h1>Tierwissen mit Herz und Pfote</h1>
            <p className="tvc-lead">
              Ratgeber, Rassenporträts und echte Geschichten rund um Hund, Katze und weitere Tierwelten – für Singles, bei
              denen Tiere zur Familie gehören.
            </p>
            <ul className="tvh-stats">
              <li><strong>{totalItems}</strong><span>Beiträge</span></li>
              <li><strong>{categories.length}</strong><span>Themen</span></li>
              <li><strong>{pages.length}</strong><span>Porträts &amp; Ratgeber</span></li>
            </ul>
            <div className="tvc-actions">
              <Link className="tvc-btn tvc-btn-primary" href="https://tierisch-verliebt.de/?AID=magazin">Kostenlos registrieren</Link>
              <a className="tvc-btn tvc-btn-ghost" href="#einstiege">Magazin entdecken <span aria-hidden="true">↓</span></a>
            </div>
          </div>

          {featuredPost ? (
            <Link className="tvm-feature" href={`/magazin/${featuredPost.slug}`}>
              <span className="tvm-feature-pin" aria-hidden="true"><HeartIcon /></span>
              {featuredPost.featuredImage ? (
                <span className="tvm-feature-media">
                  <img src={featuredPost.featuredImage} alt={featuredPost.featuredImageAlt || featuredPost.title} loading="eager" decoding="async" />
                </span>
              ) : null}
              <span className="tvm-feature-body">
                <span className="tvm-kicker">Gerade beliebt</span>
                <strong>{featuredPost.title}</strong>
                <span className="tvm-feature-excerpt">{excerpt(featuredPost.excerpt || featuredPost.content, 130)}</span>
                <span className="tvm-feature-meta">
                  {featuredPost.authorName ? <span>Von {featuredPost.authorName}</span> : null}
                  <span className="tvm-go">Jetzt lesen <span aria-hidden="true">→</span></span>
                </span>
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      <nav className="tvc-wrap tvm-topics" aria-label="Magazin-Themen">
        <Link className="tvm-topic tvm-topic-index" href="/magazin/inhalt">
          <span className="tvm-topic-icon" aria-hidden="true"><PawIcon /></span>
          <span><strong>Alles von A–Z</strong><small>Beiträge &amp; Seiten durchsuchen</small></span>
        </Link>
        {categories.slice(0, 6).map((category) => (
          <Link key={category.slug} className="tvm-topic" href={`/magazin/thema/${category.slug}`}>
            <span className="tvm-topic-icon" aria-hidden="true">{categoryIcon(category.slug)}</span>
            <span>
              <strong>{category.name}</strong>
              {category.count > 0 ? <small>{category.count} {category.count === 1 ? "Beitrag" : "Beiträge"}</small> : null}
            </span>
          </Link>
        ))}
      </nav>

      <section id="einstiege" className="tvc-wrap tvm-section" aria-labelledby="tvm-entry-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Wichtige Einstiege</span>
          <h2 id="tvm-entry-title">Hier startest du am besten</h2>
          <p>Die großen Ratgeber-Bereiche des Magazins – von Hunderassen bis Kleintiere.</p>
        </div>
        <div className="tvm-bento">
          {entryPoints.map((entry, index) => (
            <Link
              key={entry.slug}
              href={entry.href}
              className={["tvm-tile", entry.size ? `tvm-tile-${entry.size}` : "", entry.image ? "" : "tvm-tile-plain"].filter(Boolean).join(" ")}
              style={{ ["--tilt" as string]: `${index % 2 ? 0.8 : -0.8}deg` }}
            >
              {entry.image ? <img src={entry.image} alt="" loading="lazy" decoding="async" /> : null}
              <span className="tvm-tile-icon" aria-hidden="true">{entry.icon}</span>
              <span className="tvm-tile-copy">
                <strong>{entry.label}</strong>
                <small>{entry.teaser}</small>
              </span>
              <span className="tvm-tile-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="tvc-wrap tvm-section" aria-labelledby="tvm-latest-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Neueste Beiträge</span>
          <h2 id="tvm-latest-title">Frisch im Magazin</h2>
        </div>
        <ul className="tvm-posts">
          {latestPosts.map((post) => (
            <li key={post.id}>
              <Link className="tvh-card tvm-post" href={`/magazin/${post.slug}`}>
                <span className="tvh-card-media">
                  {post.featuredImage ? <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} loading="lazy" decoding="async" /> : <PawIcon />}
                  {post.categories[0] ? <span className="tvh-card-region">{categoryIcon(post.categories[0].slug)}{post.categories[0].name}</span> : null}
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
        <div className="tvm-more">
          <span>Seite 1 von {totalPages} · {totalItems} Beiträge</span>
          <div className="tvm-more-actions">
            <Link className="tvm-more-link" href="/magazin/inhalt">Alle Beiträge &amp; Seiten von A–Z</Link>
            {totalPages > 1 ? <Link className="tvc-btn tvc-btn-primary" href="/magazin/page/2">Ältere Beiträge <span aria-hidden="true">→</span></Link> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
