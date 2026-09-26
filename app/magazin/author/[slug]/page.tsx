import type { Metadata } from "next";
import Link from "@/components/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getAuthorPosts, getAuthorProfile, getKnownAuthorSlugs, isNoindexAuthorArchive } from "@/lib/author-profiles";
import { SITE_URL, formatUpdatedDate, stripHtml } from "@/lib/wordpress";
import { display } from "@/components/city-page/display-font";
import { ClockIcon, PawIcon } from "@/components/city-page/tier-icons";
import { MagazineCategoryIcon } from "@/components/magazine-category-icon";
import "@/components/city-page/tier-city-page.css";
import "@/components/city-page/tier-city-hub.css";
import "../../magazin-hub.css";
import "../../[slug]/magazin-article.css";
import { withTrailingSlash } from "@/lib/markets";
import { serializeJsonLd } from "@/lib/json-ld";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type StructuredData = Record<string, unknown>;

const CHRISTIAN_CANONICAL_PATH = "/magazin/christian";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getKnownAuthorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getAuthorPosts(slug);
  if (!posts.length) return {};

  const profile = await getAuthorProfile(slug);
  if (!profile) return {};

  const canonicalPath = slug === "christian-m-haas" ? CHRISTIAN_CANONICAL_PATH : `/magazin/author/${slug}`;
  const shouldNoindex = isNoindexAuthorArchive(slug);

  return {
    title: profile.name,
    description: profile.bio.slice(0, 155),
    alternates: {
      canonical: `${SITE_URL}${withTrailingSlash(canonicalPath)}`,
    },
    robots: shouldNoindex
      ? {
          index: false,
          follow: true,
        }
      : undefined,
    openGraph: {
      title: profile.name,
      description: profile.bio.slice(0, 155),
      url: `${SITE_URL}${withTrailingSlash(canonicalPath)}`,
      images: profile.imageUrl ? [profile.imageUrl] : undefined,
    },
  };
}

export default async function MagazineAuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const posts = await getAuthorPosts(slug);
  // Autoren ohne Beitraege (z. B. das ausgelaufene Redaktions-Archiv) leiten dauerhaft
  // auf das Autorenprofil weiter, statt ein leeres Archiv auszuliefern.
  if (!posts.length) permanentRedirect(CHRISTIAN_CANONICAL_PATH);

  const profile = await getAuthorProfile(slug);
  if (!profile) notFound();

  const latestPost = posts[0];
  const highlightedPosts = posts.slice(0, 6);
  const canonicalPath = slug === "christian-m-haas" ? CHRISTIAN_CANONICAL_PATH : profile.profileUrl;
  const canonicalUrl = `${SITE_URL}${withTrailingSlash(canonicalPath)}`;
  const shouldNoindex = isNoindexAuthorArchive(slug);
  const isEditorialTeamPage = slug === "redaktion";

  const structuredData: StructuredData[] = shouldNoindex
    ? []
    : [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Magazin", item: `${SITE_URL}/magazin/` },
            { "@type": "ListItem", position: 2, name: profile.name, item: canonicalUrl },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": isEditorialTeamPage ? "AboutPage" : "ProfilePage",
          url: canonicalUrl,
          name: profile.name,
          description: profile.bio,
          mainEntity: isEditorialTeamPage
            ? {
                "@type": "Thing",
                name: profile.name,
                description: profile.bio,
                url: canonicalUrl,
              }
            : {
                "@type": "Person",
                "@id": `${canonicalUrl}#person`,
                name: profile.name,
                description: profile.bio,
                url: canonicalUrl,
                image: profile.imageUrl,
                jobTitle: profile.role,
                sameAs: profile.links?.filter((link) => link.external).map((link) => link.href) ?? [],
                knowsAbout: profile.expertise,
              },
        },
      ];

  return (
    <main className={`tvc tvm ${display.variable}`}>
      {structuredData.map((payload) => (
        <script
          key={`${String(payload["@type"])}-${String(payload.url ?? payload.name ?? "entity")}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(payload) }}
        />
      ))}

      <section className="tvc-hero tvh-hero tvm-hero">
        <div className="tvc-wrap tvm-article-grid">
          <div className="tvc-hero-copy">
            <nav className="tvc-crumbs" aria-label="Brotkrumen">
              <Link href="/">Start</Link>
              <span aria-hidden="true">›</span>
              <Link href="/magazin">Magazin</Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{profile.name}</span>
            </nav>
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />Autorenprofil</span>
            <h1>{profile.name}</h1>
            <p className="tvm-author-role">{profile.role}</p>
            <p className="tvc-lead">{profile.intro || profile.bio}</p>

            <ul className="tvm-author-facts" aria-label="Kurzprofil und Vertrauenssignale">
              {profile.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>

            <div className="tvc-actions">
              <Link className="tvc-btn tvc-btn-primary" href="https://tierisch-verliebt.de/?AID=magazin">
                Jetzt kostenlos registrieren
              </Link>
            </div>
            <div className="tvm-author-links">
              {profile.links?.map((link) => (
                <Link
                  key={link.href}
                  className="tvm-author-link"
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <figure className="tvm-article-photo tvm-author-photo">
            {profile.imageUrl ? (
              <img src={profile.imageUrl} alt={profile.name} loading="eager" decoding="async" />
            ) : (
              <div className="expert-card-avatar-fallback" aria-hidden="true">
                {profile.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}
            <figcaption><PawIcon />{profile.name}</figcaption>
          </figure>
        </div>
      </section>

      <div className="tvc-wrap tvm-author-body">
      <section className="content-section author-editorial-section">
        <div className="author-editorial-layout">
          <article className="author-editorial-main">
            <div className="section-header">
              <span className="eyebrow eyebrow-muted">Über {profile.name.split(" ")[0]}</span>
              <h2>Persönlicher Hintergrund und redaktioneller Anspruch</h2>
            </div>
            <div className="author-story">
              {(profile.story?.length ? profile.story : [profile.bio]).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {profile.quote ? <blockquote className="author-quote">„{profile.quote}“</blockquote> : null}
          </article>

          <aside className="author-editorial-side">
            <div className="author-side-card">
              <span className="eyebrow eyebrow-muted">Schwerpunkte</span>
              <h2>Wofür dieses Profil steht</h2>
              {profile.expertise?.length ? (
                <ul className="trust-points author-expertise-list" aria-label="Themenschwerpunkte">
                  {profile.expertise.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            {latestPost ? (
              <div className="author-side-card author-latest-post-clean">
                <span className="eyebrow">Neuester Beitrag</span>
                <h3>{latestPost.title}</h3>
                <p>{stripHtml(latestPost.excerpt || latestPost.content).slice(0, 170)}…</p>
                <div className="meta-row">
                  {formatUpdatedDate(latestPost) ? <span>{formatUpdatedDate(latestPost)}</span> : null}
                  <Link href={`/magazin/${latestPost.slug}`}>Jetzt lesen</Link>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {highlightedPosts.length ? (
        <section className="tvm-section" aria-labelledby="tvm-author-posts">
          <div className="tvc-head">
            <span className="tvc-eyebrow">Beiträge von {profile.name}</span>
            <h2 id="tvm-author-posts">Aktuelle Artikel aus dem Magazin</h2>
            <p>Ratgeber, Einordnungen und Impulse rund um tierliebe Partnersuche, Alltag mit Haustieren und gemeinsame Werte.</p>
          </div>
          <ul className="tvm-posts">
            {highlightedPosts.map((post) => (
              <li key={post.id}>
                <Link href={`/magazin/${post.slug}`} className="tvh-card tvm-post">
                  <span className="tvh-card-media">
                    {post.featuredImage ? <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} loading="lazy" decoding="async" /> : <PawIcon />}
                    {post.categories[0] ? <span className="tvh-card-region"><MagazineCategoryIcon slug={post.categories[0].slug} />{post.categories[0].name}</span> : null}
                  </span>
                  <span className="tvh-card-body">
                    <strong>{post.title}</strong>
                    <span className="tvm-post-excerpt">{stripHtml(post.excerpt || post.content).slice(0, 140)}…</span>
                    {formatUpdatedDate(post) ? <span className="tvm-post-date"><ClockIcon />{formatUpdatedDate(post)}</span> : null}
                    <span className="tvh-card-go">Weiterlesen <span aria-hidden="true">→</span></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      </div>
    </main>
  );
}
