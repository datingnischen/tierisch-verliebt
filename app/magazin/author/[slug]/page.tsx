import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthorPosts, getAuthorProfile, getKnownAuthorSlugs } from "@/lib/author-profiles";
import { SITE_URL, formatGermanDate, stripHtml } from "@/lib/wordpress";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getKnownAuthorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getAuthorProfile(slug);
  if (!profile) return {};

  return {
    title: profile.name,
    description: profile.bio.slice(0, 155),
    alternates: {
      canonical: `${SITE_URL}/magazin/author/${slug}`,
    },
    openGraph: {
      title: profile.name,
      description: profile.bio.slice(0, 155),
      url: `${SITE_URL}/magazin/author/${slug}`,
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
      <section className="author-profile-hero panel-card">
        <div className="author-profile-visual">
          <div className="author-profile-portrait-frame">
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
          </div>
          <div className="author-profile-badge">
            <span className="eyebrow eyebrow-brand">Vertrauensprofil</span>
            <p>Echte Autorenseite mit klarem Themenfokus, nachvollziehbarer Einordnung und direkten Magazin-Einstiegen.</p>
          </div>
        </div>

        <div className="author-profile-copy">
          <span className="eyebrow">Autorenprofil</span>
          <h1>{profile.name}</h1>
          <p className="author-profile-role">{profile.role}</p>
          <p className="author-profile-intro">{profile.intro || profile.bio}</p>

          <div className="author-profile-facts" aria-label="Kurzprofil">
            {profile.facts.map((fact) => (
              <div key={fact} className="author-profile-fact-card">
                {fact}
              </div>
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
      </section>

      <section className="grid-two author-profile-grid">
        <article className="panel-card author-profile-panel">
          <div className="section-header">
            <span className="eyebrow eyebrow-muted">Über {profile.name.split(" ")[0]}</span>
            <h2>Persönlicher Hintergrund mit klarer redaktioneller Linie</h2>
          </div>
          <div className="author-story">
            {(profile.story?.length ? profile.story : [profile.bio]).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {profile.quote ? <blockquote className="author-quote">„{profile.quote}“</blockquote> : null}
        </article>

        <article className="panel-card author-profile-panel">
          <div className="section-header">
            <span className="eyebrow eyebrow-muted">Schwerpunkte</span>
            <h2>Wofür dieses Profil im Magazin steht</h2>
          </div>

          {profile.expertise?.length ? (
            <ul className="trust-points author-expertise-list" aria-label="Themenschwerpunkte">
              {profile.expertise.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}

          <div className="author-profile-link-list">
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

          {latestPost ? (
            <div className="author-latest-post panel-card">
              <span className="eyebrow">Neuester Beitrag</span>
              <h3>{latestPost.title}</h3>
              <p>{stripHtml(latestPost.excerpt || latestPost.content).slice(0, 170)}…</p>
              <div className="meta-row">
                {latestPost.date ? <span>{formatGermanDate(latestPost.date)}</span> : null}
                <Link href={`/magazin/${latestPost.slug}`}>Jetzt lesen</Link>
              </div>
            </div>
          ) : null}
        </article>
      </section>

      {highlightedPosts.length ? (
        <section className="content-section">
          <div className="section-header">
            <span className="eyebrow">Beiträge von {profile.name}</span>
            <h2>Artikel mit Haltung, Tiernähe und alltagsrelevantem Blick</h2>
          </div>
          <div className="stack-list">
            {highlightedPosts.map((post) => (
              <Link key={post.id} href={`/magazin/${post.slug}`} className="article-card article-card-rich author-article-card">
                {post.featuredImage ? (
                  <div className="article-card-media">
                    <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} loading="lazy" decoding="async" />
                  </div>
                ) : null}
                <div className="article-card-copy">
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
