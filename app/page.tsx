import Link from "next/link";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { getAuthorProfile } from "@/lib/author-profiles";
import { getMagazineCategories, getMagazinePages, getMagazinePosts, stripHtml } from "@/lib/wordpress";

const HOME_HERO_IMAGE = "https://static2.icony-hosting.de/dyncontent2f3e1caa346107861506226d1d547c07/img/generic2021/frontpage-v4/backgrounds/frontpage-visual-tierischverliebt.webp";

export default async function HomePage() {
  const [posts, pages, categories, expert] = await Promise.all([
    getMagazinePosts(),
    getMagazinePages(),
    getMagazineCategories(),
    getAuthorProfile("christian-m-haas"),
  ]);

  const featuredPost = posts[0];

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
          <span className="eyebrow">Magazin & Vertrauen</span>
          <h2>Das Magazin bleibt echte WordPress-Quelle — die Oberfläche wird nur klarer und stärker.</h2>
          <p>
            Beiträge, Kategorien und Autorenprofile werden direkt aus dem bestehenden Magazin gelesen und im neuen
            Frontend kundenfreundlich dargestellt.
          </p>
          <ul className="stats-list">
            <li>
              <strong>{posts.length}</strong>
              <span>aktuelle Beiträge</span>
            </li>
            <li>
              <strong>{pages.length}</strong>
              <span>wichtige Magazin-Seiten</span>
            </li>
            <li>
              <strong>{categories.length}</strong>
              <span>Magazin-Themen</span>
            </li>
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

      <section className="grid-two">
        {featuredPost ? (
          <article className="panel-card">
            <div className="section-header">
              <span className="eyebrow">Gerade beliebt</span>
              <h2>{featuredPost.title}</h2>
            </div>
            <p>{stripHtml(featuredPost.excerpt || featuredPost.content).slice(0, 220)}…</p>
            <div className="meta-row">
              {featuredPost.authorName ? <span>Von {featuredPost.authorName}</span> : null}
              {featuredPost.date ? <span>{featuredPost.date.slice(0, 10)}</span> : null}
            </div>
            <Link className="button button-primary" href={`/magazin/${featuredPost.slug}`}>
              Artikel lesen
            </Link>
          </article>
        ) : null}

        <article className="panel-card">
          <div className="section-header">
            <span className="eyebrow">Mehr aus dem Magazin</span>
            <h2>Weitere lesenswerte Einstiege</h2>
          </div>
          <div className="stack-list">
            {[...posts.slice(1, 4), ...pages.slice(0, 2)].map((entry) => (
              <Link key={`${entry.type}-${entry.id}`} href={`/magazin/${entry.slug}`} className="article-card">
                <h3>{entry.title}</h3>
                <p>{stripHtml(entry.excerpt || entry.content).slice(0, 150)}…</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
