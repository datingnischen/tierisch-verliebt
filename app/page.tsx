import type { Metadata } from "next";
import Link from "next/link";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { getAuthorProfile } from "@/lib/author-profiles";
import { staticAsset } from "@/lib/static-asset";
import { formatGermanDate, getMagazineCategories, getMagazinePages, getMagazinePosts, SITE_URL, stripHtml } from "@/lib/wordpress";

const HOME_HERO_IMAGE = staticAsset("/home/frontpage-visual-tierischverliebt.webp");

export const metadata: Metadata = {
  title: "tierisch-verliebt.de – Singles, Tierwelten & Magazin",
  description:
    "Finde tierliebe Singles, entdecke Magazin-Themen rund um Hund, Katze und weitere Tierwelten und starte kostenlos in eine Partnersuche mit Herz für Tiere.",
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: "tierisch-verliebt.de – Singles, Tierwelten & Magazin",
    description:
      "Finde tierliebe Singles, entdecke Magazin-Themen rund um Hund, Katze und weitere Tierwelten und starte kostenlos in eine Partnersuche mit Herz für Tiere.",
    url: `${SITE_URL}/`,
    images: [HOME_HERO_IMAGE],
  },
};

export default async function HomePage() {
  const [posts, pages, categories, expert] = await Promise.all([
    getMagazinePosts(),
    getMagazinePages(),
    getMagazineCategories(),
    getAuthorProfile("christian-m-haas"),
  ]);

  const featuredPost = posts[0];
  const magazineStarts = [...posts.slice(1, 4), ...pages.slice(0, 1)];

  return (
    <main className="shell">
      <section className="home-stage panel-card">
        <div className="home-stage-copy">
          <span className="eyebrow eyebrow-brand">Tierliebe Partnersuche</span>
          <h1>Finde tierliebe Singles in deiner Nähe — mit Hund, Katze oder einfach ganz viel Herz für Tiere.</h1>
          <p>
            tierisch-verliebt.de verbindet tierliebe Singles, Haustiergeschichten und Magazinwissen in einer ruhigen,
            warmen Oberfläche. So wird aus gemeinsamer Tierliebe ein echter Gesprächseinstieg.
          </p>
          <ul className="trust-points" aria-label="Vertrauenssignale">
            <li>Über 20 Jahre Erfahrung im Online-Dating</li>
            <li>Server in Deutschland</li>
            <li>Keine versteckten Kosten beim Einstieg</li>
          </ul>
          <div className="button-row">
            <Link className="button button-primary" href="https://tierisch-verliebt.de/?AID=magazin">
              Jetzt kostenlos registrieren
            </Link>
            <Link className="button button-secondary" href="/magazin">
              Zum Magazin
            </Link>
          </div>
        </div>

        <div className="home-stage-visual">
          <div className="home-stage-picture">
            <img src={HOME_HERO_IMAGE} alt="Tierisch Verliebt Startseitenmotiv" loading="eager" decoding="async" />
          </div>
          <div className="floating-entry-card">
            <span className="eyebrow">Beliebter Einstieg</span>
            <h2>{featuredPost?.title || "Tierwelten, Ratgeber und tierliebe Singles"}</h2>
            <p>
              Lies passende Magazin-Inhalte, entdecke Tierwelten und starte dann direkt in die kostenlose
              Registrierung für tierliebe Singles.
            </p>
            <Link className="button button-primary" href={featuredPost ? `/magazin/${featuredPost.slug}` : "/magazin"}>
              Jetzt ansehen
            </Link>
          </div>
        </div>
      </section>

      <section className="grid-two">
        <article className="panel-card">
          <span className="eyebrow">Tierwelten</span>
          <h2>Finde schneller Themen, die zu deinem Tieralltag passen</h2>
          <p>
            Hunde, Katzen und weitere Tierwelten führen direkt zu den passenden Magazin-Rubriken und geben neuen
            Gesprächen sofort einen natürlichen Einstieg.
          </p>
          <div className="chip-row">
            <Link className="chip" href="/magazin/hunderassen">Hunde</Link>
            <Link className="chip" href="/magazin/beliebtesten-katzenrassen">Katzen</Link>
            <Link className="chip" href="/magazin/tierwelten">Weitere Tierwelten</Link>
            <Link className="chip" href="/magazin/thema/apps">Apps</Link>
          </div>
        </article>

        <article className="panel-card">
          <span className="eyebrow">Magazin & Einstieg</span>
          <h2>Hier treffen Tierwelten, Kennenlernen und hilfreiche Magazin-Inhalte aufeinander.</h2>
          <p>
            Du bekommst Ratgeber, alltagsnahe Tier-Themen und direkte Wege zu passenden Kontakten — ohne Umwege und
            ohne unklare Einstiege.
          </p>
          <ul className="trust-points" aria-label="Stärken von tierisch-verliebt.de">
            <li>Hund, Katze und weitere Tierwelten mit klaren Einstiegen</li>
            <li>Magazin, Geschichten und Partnersuche greifen sauber ineinander</li>
            <li>Direkte Wege zu Anmeldung, Themenwelten und vertrauensvollen Artikeln</li>
          </ul>
        </article>
      </section>

      {expert ? (
        <section className="content-section">
          <ExpertTrustCard
            profile={expert}
            eyebrow="Unser Datingexperte & Tierliebhaber"
            title="Hinter tierisch-verliebt.de steht ein reales Profil mit Tierliebe, Dating-Erfahrung und klarer Magazinbegleitung."
            primaryLabel="Zum Expertenprofil"
          />
        </section>
      ) : null}

      <section className="content-section">
        <div className="section-header">
          <span className="eyebrow">Beliebte Themen</span>
          <h2>Womit willst du starten?</h2>
        </div>
        <div className="chip-row">
          {categories.slice(0, 8).map((category) => (
            <Link key={category.slug} className="chip" href={`/magazin/thema/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid-two home-reading-grid">
        {featuredPost ? (
          <article className="panel-card home-feature-card">
            <div className="section-header home-feature-header">
              <span className="eyebrow">Gerade beliebt</span>
              <h2>{featuredPost.title}</h2>
            </div>
            <p className="home-feature-excerpt">{stripHtml(featuredPost.excerpt || featuredPost.content).slice(0, 220)}…</p>
            <div className="meta-row home-feature-meta">
              {featuredPost.authorName ? <span>Von {featuredPost.authorName}</span> : null}
              {featuredPost.date ? <span>{formatGermanDate(featuredPost.date)}</span> : null}
            </div>
            <div className="button-row home-feature-actions">
              <Link className="button button-primary" href={`/magazin/${featuredPost.slug}`}>
                Artikel lesen
              </Link>
            </div>
          </article>
        ) : null}

        <article className="panel-card home-more-card">
          <div className="section-header home-more-header">
            <span className="eyebrow">Mehr aus dem Magazin</span>
            <h2>Weitere lesenswerte Einstiege</h2>
          </div>
          <div className="home-more-list">
            {magazineStarts.map((entry) => (
              <Link key={`${entry.type}-${entry.id}`} href={`/magazin/${entry.slug}`} className="home-more-link">
                <div className="meta-row home-more-meta">
                  {entry.categories[0] ? <span>{entry.categories[0].name}</span> : null}
                  {entry.date ? <span>{formatGermanDate(entry.date)}</span> : null}
                </div>
                <h3>{entry.title}</h3>
                <p>{stripHtml(entry.excerpt || entry.content).slice(0, 145)}…</p>
              </Link>
            ))}
          </div>
          <div className="button-row home-more-actions">
            <Link className="button button-secondary" href="/magazin">
              Mehr im Magazin ansehen
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
