import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthorPosts, getAuthorProfile, getKnownAuthorSlugs } from "@/lib/author-profiles";
import { SITE_URL, formatGermanDate, stripHtml } from "@/lib/wordpress";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const CHRISTIAN_CANONICAL_PATH = "/magazin/christian";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getKnownAuthorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getAuthorProfile(slug);
  if (!profile) return {};

  const canonicalPath = slug === "christian-m-haas" ? CHRISTIAN_CANONICAL_PATH : `/magazin/author/${slug}`;
  const shouldNoindex = slug === "christian-m-haas";

  return {
    title: profile.name,
    description: profile.bio.slice(0, 155),
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
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
      url: `${SITE_URL}${canonicalPath}`,
      images: profile.imageUrl ? [profile.imageUrl] : undefined,
    },
  };
}

export default async function MagazineAuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const [profile, posts] = await Promise.all([getAuthorProfile(slug), getAuthorPosts(slug)]);
  if (!profile) notFound();

  const latestPost = posts[0];
  const highlightedPosts = posts.slice(0, 6);

  return (
    <main className="shell shell-narrow">
      <section className="author-hero-simple">
        <div className="author-hero-simple-grid">
          <div className="author-hero-simple-media">
            {profile.imageUrl ? (
              <img src={profile.imageUrl} alt={profile.name} loading="eager" decoding="async" className="author-hero-simple-photo" />
            ) : (
              <div className="expert-card-avatar-fallback" aria-hidden="true">
                {profile.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}
          </div>

          <div className="author-hero-simple-copy">
            <span className="eyebrow">Autorenprofil</span>
            <h1>{profile.name}</h1>
            <p className="author-profile-role">{profile.role}</p>
            <p className="author-profile-intro">{profile.intro || profile.bio}</p>

            <div className="author-trust-facts-inline" aria-label="Kurzprofil und Vertrauenssignale">
              {profile.facts.map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
            </div>

            <div className="author-profile-link-list author-profile-link-list-hero">
              {profile.links?.map((link) => (
                <Link
                  key={link.href}
                  className="chip"
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="button-row">
              <Link className="button button-primary" href="https://tierisch-verliebt.de/?AID=magazin">
                Jetzt kostenlos registrieren
              </Link>
              <Link className="button button-secondary" href="/magazin">
                Zum Magazin
              </Link>
            </div>
          </div>
        </div>
      </section>

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
                  {latestPost.date ? <span>{formatGermanDate(latestPost.date)}</span> : null}
                  <Link href={`/magazin/${latestPost.slug}`}>Jetzt lesen</Link>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      {highlightedPosts.length ? (
        <section className="content-section">
          <div className="section-header">
            <span className="eyebrow">Beiträge von {profile.name}</span>
            <h2>Aktuelle Artikel aus dem Magazin</h2>
            <p>Ratgeber, Einordnungen und Impulse rund um tierliebe Partnersuche, Alltag mit Haustieren und gemeinsame Werte.</p>
          </div>
          <div className="author-post-grid">
            {highlightedPosts.map((post) => (
              <Link key={post.id} href={`/magazin/${post.slug}`} className="author-post-card">
                {post.featuredImage ? (
                  <div className="author-post-card-media">
                    <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} loading="lazy" decoding="async" />
                  </div>
                ) : (
                  <div className="author-post-card-media author-post-card-placeholder" aria-hidden="true" />
                )}
                <div className="author-post-card-body">
                  <div className="meta-row">
                    {post.date ? <span>{formatGermanDate(post.date)}</span> : null}
                    {post.categories[0] ? <span>{post.categories[0].name}</span> : null}
                  </div>
                  <h3>{post.title}</h3>
                  <p>{stripHtml(post.excerpt || post.content).slice(0, 165)}…</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
