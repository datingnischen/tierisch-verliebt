import type { Metadata } from "next";
import Link from "@/components/link";
import { SITE_URL, getAllMagazineEntries, type MagazineEntry } from "@/lib/wordpress";
import { buildMagazineFaqGraph } from "@/lib/magazine-faq";
import { serializeJsonLd } from "@/lib/json-ld";
import { TIERWELT_COUNT, TIERWELT_FAQ, TIERWELT_GROUPS, TIERWELT_MATCHES, findTierwelt } from "@/lib/tierwelten";
import "./tierwelten.css";

export const revalidate = 300;

const PAGE_URL = `${SITE_URL}/magazin/tierwelten/`;
const REGISTER_URL = "https://tierisch-verliebt.de/?AID=magazin";
const TITLE = "Tierwelten: Katzen, Hunde, Vögel & Pferde für tierliebe Singles";
const DESCRIPTION =
  "Entdecke alle Tierwelten von tierisch-verliebt.de – von Perserkatze und Maine Coon über Havaneser bis zu Vögeln und Pferden. Rasseporträts, Haltungstipps und Singles mit derselben Tierliebe.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, type: "website" },
};

const faqItems = TIERWELT_FAQ.map((item, index) => ({
  id: `faq-frage-${index + 1}`,
  question: item.question,
  answerHtml: item.answer,
  answerText: item.answer,
}));

function buildPageGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "de-DE",
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
        mainEntity: { "@id": `${PAGE_URL}#tierwelten` },
      },
      {
        "@type": "ItemList",
        "@id": `${PAGE_URL}#tierwelten`,
        name: "Tierwelten auf tierisch-verliebt.de",
        numberOfItems: TIERWELT_COUNT,
        itemListElement: TIERWELT_GROUPS.flatMap((group) => group.worlds).map((world, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: world.name,
          url: `${SITE_URL}/magazin/${world.slug}/`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Magazin", item: `${SITE_URL}/magazin/` },
          { "@type": "ListItem", position: 2, name: "Tierwelten", item: PAGE_URL },
        ],
      },
    ],
  };
}

async function loadEntries() {
  try {
    const entries = await getAllMagazineEntries();
    return new Map(entries.map((entry) => [entry.slug, entry]));
  } catch {
    return new Map<string, MagazineEntry>();
  }
}

export default async function TierweltenPage() {
  const entries = await loadEntries();
  const faqGraph = buildMagazineFaqGraph({ items: faqItems, pageUrl: PAGE_URL, pageName: "Häufige Fragen zu den Tierwelten" });

  return (
    <main className="shell tierwelten-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildPageGraph()) }} />
      {faqGraph ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqGraph) }} /> : null}

      <nav className="tierwelten-breadcrumb" aria-label="Brotkrumen">
        <Link href="/magazin">Magazin</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Tierwelten</span>
      </nav>

      <section className="tierwelten-hero">
        <div className="tierwelten-hero-copy">
          <span className="eyebrow">Alle Tierwelten</span>
          <h1>
            Finde deine Tierwelt – <span>und Menschen, die genauso ticken.</span>
          </h1>
          <p>
            Katzenmensch, Hundefreund, Vogelliebhaberin oder Reiter? Jede Tierwelt bündelt Rasseporträts, Haltungstipps
            und Geschichten aus dem Magazin – und führt dich direkt zu Singles, die deine Tierliebe teilen.
          </p>
          <div className="button-row">
            <a className="button button-primary" href="#katzenwelten">
              Tierwelten entdecken
            </a>
            <Link className="button button-secondary" href={REGISTER_URL}>
              Kostenlos registrieren
            </Link>
          </div>
        </div>
        <ul className="tierwelten-hero-stats" aria-label="Tierwelten in Zahlen">
          <li>
            <strong>{TIERWELT_COUNT}</strong>
            <span>Tierwelten</span>
          </li>
          <li>
            <strong>{TIERWELT_GROUPS.length}</strong>
            <span>Tierfamilien</span>
          </li>
          <li>
            <strong>0 €</strong>
            <span>zum Start</span>
          </li>
        </ul>
      </section>

      <nav className="tierwelten-group-nav" aria-label="Direkt zur Tierfamilie">
        {TIERWELT_GROUPS.map((group) => (
          <a key={group.id} href={`#${group.id}`} className="tierwelten-group-tile">
            <span className="tierwelten-group-emoji" aria-hidden="true">
              {group.emoji}
            </span>
            <span className="tierwelten-group-name">{group.name}</span>
            <span className="tierwelten-group-count">
              {group.worlds.length} {group.worlds.length === 1 ? "Tierwelt" : "Tierwelten"}
            </span>
          </a>
        ))}
      </nav>

      {TIERWELT_GROUPS.map((group) => (
        <section key={group.id} id={group.id} className="tierwelten-group" aria-labelledby={`${group.id}-titel`}>
          <header className="tierwelten-group-header">
            <span className="tierwelten-group-badge" aria-hidden="true">
              {group.emoji}
            </span>
            <div>
              <h2 id={`${group.id}-titel`}>{group.name}</h2>
              <p className="tierwelten-group-claim">{group.claim}</p>
              <p>{group.intro}</p>
              {group.category ? (
                <Link className="tierwelten-group-more" href={`/magazin/thema/${group.category.slug}`}>
                  Alle Artikel im {group.category.label} →
                </Link>
              ) : null}
            </div>
          </header>

          <div className={`tierwelten-grid${group.worlds.length === 1 ? " tierwelten-grid-single" : ""}`}>
            {group.worlds.map((world) => {
              const entry = entries.get(world.slug);
              return (
                <article key={world.slug} className="tierwelt-card">
                  <Link href={`/magazin/${world.slug}`} className="tierwelt-card-media" tabIndex={-1} aria-hidden="true">
                    {entry?.featuredImage ? (
                      <img src={entry.featuredImage} alt="" loading="lazy" decoding="async" />
                    ) : (
                      <span className="tierwelt-card-fallback">{group.emoji}</span>
                    )}
                    <span className="tierwelt-card-tagline">{world.tagline}</span>
                  </Link>
                  <div className="tierwelt-card-body">
                    <h3>
                      <Link href={`/magazin/${world.slug}`}>{world.name}</Link>
                    </h3>
                    <p>{world.teaser}</p>
                    <ul className="tierwelt-card-traits" aria-label={`Typisch für ${world.name}`}>
                      {world.traits.map((trait) => (
                        <li key={trait}>{trait}</li>
                      ))}
                    </ul>
                    <Link className="tierwelt-card-cta" href={`/magazin/${world.slug}`}>
                      {world.cta} <span aria-hidden="true">→</span>
                    </Link>
                    {world.domains.length ? (
                      <p className="tierwelt-card-domains">Auch erreichbar über {world.domains.join(", ")}</p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <section className="tierwelten-match" aria-labelledby="tierwelten-match-titel">
        <div className="section-header">
          <span className="eyebrow eyebrow-brand">Orientierung</span>
          <h2 id="tierwelten-match-titel">Welche Tierwelt passt zu dir?</h2>
          <p>Noch unentschlossen? Starte bei dem, was dir im Alltag mit Tier am wichtigsten ist.</p>
        </div>
        <ul className="tierwelten-match-list">
          {TIERWELT_MATCHES.map((match) => (
            <li key={match.need} className="tierwelten-match-item">
              <span className="tierwelten-match-emoji" aria-hidden="true">
                {match.emoji}
              </span>
              <span className="tierwelten-match-need">{match.need}</span>
              <span className="tierwelten-match-links">
                {match.slugs.map((slug) => {
                  const found = findTierwelt(slug);
                  return found ? (
                    <Link key={slug} className="chip" href={`/magazin/${slug}`}>
                      {found.world.name}
                    </Link>
                  ) : null;
                })}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="tierwelten-cta">
        <div>
          <span className="eyebrow">Singlebörse</span>
          <h2>Deine Tierliebe ist kein Nebensatz im Profil.</h2>
          <p>
            Bei tierisch-verliebt.de ist sie der Anfang. Lerne Singles kennen, für die Hund, Katze, Pferd oder Vogel
            genauso zur Familie gehören wie für dich.
          </p>
        </div>
        <Link className="button button-primary" href={REGISTER_URL}>
          Jetzt kostenlos registrieren
        </Link>
      </section>

      <section className="breed-faq-card tierwelten-faq" id="faq" aria-labelledby="faq-titel">
        <div className="breed-faq-header">
          <span className="eyebrow eyebrow-brand">FAQ</span>
          <h2 id="faq-titel">Häufige Fragen zu den Tierwelten</h2>
        </div>
        <div className="breed-faq-list">
          {faqItems.map((item, index) => (
            <details key={item.id} className="breed-faq-item" id={item.id} open={index === 0}>
              <summary>{item.question}</summary>
              <div className="breed-faq-answer">
                <p>{item.answerText}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <aside className="tierwelten-network-note">
        <h2>Transparenz-Hinweis zu unserem Netzwerk</h2>
        <p>
          Die genannten Internetadressen sind thematische Einstiegsdomains unseres Netzwerks. Sie führen Tierfreunde direkt
          in die jeweilige Tierwelt; sämtliche Inhalte, redaktionellen Beiträge und Community-Funktionen stellt
          tierisch-verliebt.de zentral bereit.
        </p>
      </aside>
    </main>
  );
}
