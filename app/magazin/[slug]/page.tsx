import type { Metadata } from "next";
import Link from "@/components/link";
import { notFound } from "next/navigation";
import { AuthorProfileFacts } from "@/components/author-profile-facts";
import { display } from "@/components/city-page/display-font";
import { ClockIcon, PawIcon } from "@/components/city-page/tier-icons";
import { MagazineCategoryIcon } from "@/components/magazine-category-icon";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { MagazineHubGrid } from "@/components/magazine-hub-grid";
import "@/components/city-page/tier-city-page.css";
import "./magazin-article.css";
import { getAuthorProfile } from "@/lib/author-profiles";
import { staticAsset } from "@/lib/static-asset";
import {
  SITE_URL,
  decodeHtmlEntities,
  formatUpdatedDate,
  getAllMagazineEntries,
  getMagazineEntryBySlug,
  relativizeInternalLinks,
  stripHtml,
  type MagazineEntry,
} from "@/lib/wordpress";
import { withTrailingSlash } from "@/lib/markets";
import { buildChristianBookProfileGraph, stripPublishedBookSchema } from "@/lib/christian-book-profile-schema";
import { buildMagazineFaqGraph, getMagazineFaqItems, getMagazineFaqSubject, renderMagazineFaqSection } from "@/lib/magazine-faq";
import { serializeJsonLd } from "@/lib/json-ld";
import { buildMagazineArticleGraph } from "@/lib/site-entities";
import { detectMagazineAnimal, getMagazineSidebarVariant, type MagazineSidebarVariant } from "@/lib/magazine-animal";
import { splitHubLinkList } from "@/lib/magazine-hub";
import { extractLeadImage } from "@/lib/magazine-lead-image";
import { findTierwelt } from "@/lib/tierwelten";
import {
  enhanceBreedContent,
  getBreedName,
  getBreedSectionLinks,
  getLeadText,
  parseBreedProfile,
  pickKeyFacts,
} from "@/lib/magazine-breed";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

const ONLINE_IFRAME_SRC = "https://js.icony.com/frame/?w=300&h=300&id=tierischverliebt&pc=c02e2e&aid=magazin";
const UNLISTED_CATEGORY_SLUGS = new Set(["allgemein", "uncategorized"]);
const CHRISTIAN_PAGE_DESCRIPTION =
  "Christian M. Haas ist Gründer von tierisch-verliebt.de, Datingexperte und Tierliebhaber. Erfahre mehr über seine Tierverbundenheit, Dating-Erfahrung und redaktionellen Schwerpunkte.";

const HUB_EMOJI: Record<string, string> = { katze: "🐱", hund: "🐶", vogel: "🐦", pferd: "🐴" };

async function loadHubEntries() {
  try {
    const entries = await getAllMagazineEntries();
    return new Map(entries.map((item) => [item.slug, item]));
  } catch {
    return new Map<string, MagazineEntry>();
  }
}

function MagazineRadarCard() {
  return (
    <Link className="magazine-radar-card" href="https://tierisch-verliebt.de/?AID=magazin">
      <img
        src={staticAsset("/brand/umkreissuche-radar.svg")}
        alt="Umkreissuche: Tierfreunde in deiner Nähe – kostenlos anmelden"
        width={320}
        height={480}
        loading="lazy"
        decoding="async"
      />
    </Link>
  );
}

function MagazineConversionRail({
  title,
  variant,
  showRadar = false,
}: {
  title: string;
  variant: Required<MagazineSidebarVariant>;
  showRadar?: boolean;
}) {
  return (
    <div className="magazine-conversion-rail">
      <div className="magazine-conversion-card magazine-conversion-card-primary magazine-conversion-card-banner">
        <figure className="magazine-conversion-hero">
          <img src={staticAsset(variant.image)} alt={variant.imageAlt} loading="lazy" decoding="async" />
        </figure>
        <div className="magazine-conversion-body">
          <span className="eyebrow eyebrow-brand">Singlebörse</span>
          <h2>Tierliebe Singles statt nur weiterlesen</h2>
          <p>
            Wer bei {title} landet, sucht oft mehr als Infos — nämlich {variant.audience}.
          </p>
          <ul className="magazine-conversion-points" aria-label="Einstiegsvorteile">
            <li>Kostenlos starten</li>
            <li>Tierliebe Singles</li>
            <li>Direkter Einstieg</li>
          </ul>
          <div className="button-row">
            <Link className="button button-primary" href="https://tierisch-verliebt.de/?AID=magazin">
              Kostenlos registrieren
            </Link>
          </div>
        </div>
      </div>

      {showRadar ? <MagazineRadarCard /> : null}

      <div className="magazine-conversion-card magazine-conversion-card-online">
        <span className="eyebrow eyebrow-muted">Gerade online</span>
        <h3>Wer ist gerade auf tierisch-verliebt.de online?</h3>
        <div className="magazine-online-frame-wrap">
          <iframe
            title="Gerade online auf tierisch-verliebt.de"
            className="magazine-online-frame"
            src={ONLINE_IFRAME_SRC}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="magazine-conversion-card magazine-conversion-card-reasons">
        <span className="eyebrow eyebrow-muted">Warum hier?</span>
        <h3>Gute Gründe für den Einstieg</h3>
        <ul className="magazine-reason-list" aria-label="Vorteile der Singlebörse">
          <li>
            <span className="magazine-reason-icon" aria-hidden="true">🐾</span>
            <span><strong>Echte Tierliebe</strong> statt austauschbarer Flirts</span>
          </li>
          <li>
            <span className="magazine-reason-icon" aria-hidden="true">📖</span>
            <span><strong>Direkter Einstieg</strong> aus Magazin, Tierwelt und Ratgeber</span>
          </li>
          <li>
            <span className="magazine-reason-icon" aria-hidden="true">💚</span>
            <span><strong>Kostenlos starten</strong> und passende Kontakte entdecken</span>
          </li>
        </ul>
        <Link className="button button-primary magazine-reason-button" href="https://tierisch-verliebt.de/?AID=magazin">
          Jetzt Singles entdecken
        </Link>
      </div>
    </div>
  );
}

function truncateAtWord(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/** Anriss im Hero: WP-Auszug ohne eigenes Satzende bekommt Auslassungspunkte. */
function heroLead(entry: MagazineEntry) {
  const lead = truncateAtWord(stripHtml(entry.excerpt || entry.content).replace(/\s*(\[…\]|\[\.\.\.\]|…)\s*$/, ""), 220);
  return /[.!?…]$/.test(lead) ? lead : `${lead} …`;
}

/** Lesezeit bei ~200 Wörtern pro Minute, mindestens eine Minute. */
function readingMinutes(html: string) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const BREED_EYEBROW: Record<string, string> = { katze: "Katzenrasse", hund: "Hunderasse", vogel: "Vogelart", pferd: "Pferderasse" };

/** Intro-Text: bei Rassen der erste Absatz – der WP-Auszug beginnt dort mit „Kurzbeschreibung …“. */
function entryIntro(entry: MagazineEntry) {
  const lead = parseBreedProfile(entry.content) ? getLeadText(entry.content) : "";
  return lead || stripHtml(entry.excerpt || entry.content);
}

function entryDescription(slug: string, entry: MagazineEntry) {
  return slug === "christian" ? CHRISTIAN_PAGE_DESCRIPTION : entryIntro(entry).slice(0, 155);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getMagazineEntryBySlug(slug);
  if (!entry) return {};

  const description = entryDescription(slug, entry);

  return {
    title: entry.title,
    description,
    alternates: {
      canonical: `${SITE_URL}/magazin/${slug}/`,
    },
    openGraph: {
      title: entry.title,
      description,
      url: `${SITE_URL}/magazin/${slug}/`,
      type: entry.type === "post" ? "article" : "website",
      images: entry.featuredImage ? [entry.featuredImage] : undefined,
    },
  };
}

export default async function MagazineDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await getMagazineEntryBySlug(slug);
  if (!entry) notFound();

  const authorProfile = entry.authorSlug ? await getAuthorProfile(entry.authorSlug) : null;
  const breedProfile = parseBreedProfile(entry.content);
  const breedPage = Boolean(breedProfile);
  const breedName = getBreedName(entry.title);
  // Ohne Beitragsbild wird ein Bild ganz am Anfang des Inhalts zum Artikelbild (z. B. Apps-Beiträge).
  const leadImage = entry.featuredImage ? null : extractLeadImage(entry.content);
  const heroImage = entry.featuredImage
    ? { src: entry.featuredImage, alt: entry.featuredImageAlt || entry.title }
    : leadImage
      ? { src: leadImage.image.src, alt: leadImage.image.alt || entry.title }
      : null;
  const bodyContent = leadImage ? leadImage.content : entry.content;
  const bodyBreedProfile = breedProfile && leadImage ? parseBreedProfile(bodyContent) : breedProfile;
  const enhancedContent = bodyBreedProfile ? enhanceBreedContent(bodyBreedProfile, breedName) : bodyContent;
  const faqItems = getMagazineFaqItems(entry.content);
  const renderedContent = renderMagazineFaqSection(enhancedContent, getMagazineFaqSubject(entry.title));
  const schemaDedupedContent = relativizeInternalLinks(stripPublishedBookSchema(renderedContent));
  const breedKeyFacts = breedProfile ? pickKeyFacts(breedProfile.facts) : [];
  const breedSections = breedPage ? getBreedSectionLinks(entry.content, breedName) : [];
  const profileGraph = buildChristianBookProfileGraph({
    slug,
    christianSlug: "christian",
    content: entry.content,
    canonicalUrl: `${SITE_URL}/magazin/christian/`,
    siteUrl: SITE_URL,
    profileName: "Christian M. Haas",
    profileDescription: CHRISTIAN_PAGE_DESCRIPTION,
    profileImage: authorProfile?.imageUrl || entry.featuredImage || undefined,
    jobTitle: authorProfile?.role || "Gründer von tierisch-verliebt.de, Datingexperte und Tierliebhaber",
    sameAs: authorProfile?.sameAs,
    knowsAbout: [
      "Online-Dating",
      "tierfreundliche Partnersuche",
      "Dating-Communities für Tierfreunde",
      "Leben mit Hund, Katze und Papagei",
      "Aufbau und Betrieb von Singlebörsen",
    ],
    breadcrumb: [
      { name: "Startseite", url: SITE_URL },
      { name: "Magazin", url: `${SITE_URL}/magazin/` },
      { name: "Christian M. Haas", url: `${SITE_URL}/magazin/christian/` },
    ],
    dateModified: entry.modified || undefined,
  });
  // Übersichtsseiten (z. B. Katzenrassen): die Linkliste wird zum Kachel-Grid über die volle Breite.
  const hub = breedPage ? null : splitHubLinkList(schemaDedupedContent);
  const hubEntries = hub ? await loadHubEntries() : null;
  const magazineAnimal = detectMagazineAnimal({
    tierweltGroupId: findTierwelt(slug)?.group.id,
    title: entry.title,
    content: entry.content,
    categorySlugs: entry.categories.map((category) => category.slug),
  });
  const sidebarVariant = getMagazineSidebarVariant(magazineAnimal);
  const articleCategory = entry.categories.find((category) => !UNLISTED_CATEGORY_SLUGS.has(category.slug));
  // Christians Profil hat mit profileGraph schon sein eigenes Markup.
  const articleGraph =
    slug === "christian"
      ? null
      : buildMagazineArticleGraph({
          siteUrl: SITE_URL,
          url: `${SITE_URL}/magazin/${slug}/`,
          type: entry.type,
          headline: decodeHtmlEntities(entry.title),
          description: entryDescription(slug, entry),
          image: heroImage && /^https?:\/\//.test(heroImage.src) ? heroImage.src : undefined,
          datePublished: entry.date,
          dateModified: entry.modified,
          author: entry.authorName
            ? {
                name: authorProfile?.name || entry.authorName,
                url: authorProfile ? `${SITE_URL}${withTrailingSlash(authorProfile.profileUrl)}` : undefined,
              }
            : undefined,
          category: articleCategory
            ? { name: decodeHtmlEntities(articleCategory.name), url: `${SITE_URL}/magazin/thema/${articleCategory.slug}/` }
            : undefined,
        });
  const faqGraph = buildMagazineFaqGraph({
    items: faqItems,
    pageUrl: `${SITE_URL}/magazin/${slug}/`,
    pageName: `Häufige Fragen zu ${decodeHtmlEntities(entry.title)}`,
  });

  return (
    <main className={breedPage ? "magazine-detail-page" : `tvc tvm-article ${display.variable}`}>
      {articleGraph ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleGraph) }}
        />
      ) : null}
      {profileGraph ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(profileGraph) }}
        />
      ) : null}
      {faqGraph ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqGraph) }}
        />
      ) : null}
      {breedPage ? null : (
        <section className="tvc-hero tvm-article-hero">
          <div className="tvc-wrap tvm-article-grid">
            <div className="tvc-hero-copy">
              <nav className="tvc-crumbs" aria-label="Brotkrumen">
                <Link href="/">Start</Link>
                <span aria-hidden="true">›</span>
                <Link href="/magazin">Magazin</Link>
                {articleCategory ? (
                  <>
                    <span aria-hidden="true">›</span>
                    <Link href={`/magazin/thema/${articleCategory.slug}`}>{decodeHtmlEntities(articleCategory.name)}</Link>
                  </>
                ) : null}
              </nav>
              <span className="tvc-badge">
                <span className="tvm-badge-icon" aria-hidden="true">{articleCategory ? <MagazineCategoryIcon slug={articleCategory.slug} /> : <PawIcon />}</span>
                {articleCategory ? decodeHtmlEntities(articleCategory.name) : entry.type === "post" ? "Magazin-Artikel" : "Magazin-Seite"}
              </span>
              <h1>{entry.title}</h1>
              <p className="tvc-lead">{slug === "christian" ? CHRISTIAN_PAGE_DESCRIPTION : heroLead(entry)}</p>
              <div className="tvm-article-meta">
                {entry.authorName ? (
                  <span className="tvm-article-author">
                    {authorProfile?.imageUrl ? <img src={authorProfile.imageUrl} alt="" width={40} height={40} /> : null}
                    <span>Von {authorProfile ? <Link href={authorProfile.profileUrl}>{entry.authorName}</Link> : entry.authorName}</span>
                  </span>
                ) : null}
                {formatUpdatedDate(entry) ? <span>{formatUpdatedDate(entry)}</span> : null}
                {entry.type === "post" ? <span className="tvm-article-read"><ClockIcon />{readingMinutes(entry.content)} Min. Lesezeit</span> : null}
              </div>
              <div className="tvc-actions">
                <Link className="tvc-btn tvc-btn-primary" href="https://tierisch-verliebt.de/?AID=magazin">Kostenlos registrieren</Link>
                <a className="tvc-btn tvc-btn-ghost" href="#inhalt">{entry.type === "post" ? "Zum Artikel" : "Zum Inhalt"} <span aria-hidden="true">↓</span></a>
              </div>
            </div>
            {heroImage ? (
              <figure className="tvm-article-photo">
                <img src={heroImage.src} alt={heroImage.alt} loading="eager" decoding="async" fetchPriority="high" />
                <figcaption><PawIcon />tierisch-verliebt Magazin</figcaption>
              </figure>
            ) : null}
          </div>
        </section>
      )}

      <div id="inhalt" className={`shell shell-narrow magazine-detail-shell${breedPage ? " breed-detail-shell" : " tvm-article-shell"}`}>
      {breedPage ? (
        <section className="hero-card hero-magazine hero-magazine-breed">
          <div className="breed-hero-grid">
            <div className="breed-hero-copy">
              <div className="breed-hero-eyebrows">
                <span className="eyebrow">{BREED_EYEBROW[magazineAnimal] ?? "Rasseporträt"}</span>
                <span className="eyebrow eyebrow-muted">Steckbrief &amp; Ratgeber</span>
              </div>
              <h1>{entry.title}</h1>
              <p className="breed-hero-intro">{truncateAtWord(entryIntro(entry), 230)}</p>
              <div className="meta-row">
                {entry.authorName ? (
                  <span>
                    Von {authorProfile ? <Link href={authorProfile.profileUrl}>{entry.authorName}</Link> : entry.authorName}
                  </span>
                ) : null}
                {formatUpdatedDate(entry) ? <span>{formatUpdatedDate(entry)}</span> : null}
                <Link className="button button-primary meta-row-cta" href="https://tierisch-verliebt.de/?AID=magazin">
                  Kostenlos registrieren
                </Link>
              </div>
            </div>
            {heroImage ? (
              <figure className="article-hero-media article-hero-media-breed breed-hero-media">
                <img src={heroImage.src} alt={heroImage.alt} loading="eager" decoding="async" fetchPriority="high" />
              </figure>
            ) : null}
          </div>
          {breedKeyFacts.length ? (
            <dl className="breed-highlight-grid" aria-label={`${breedName} in Kennzahlen`}>
              {breedKeyFacts.map((fact) => (
                <div key={fact.label} className="breed-highlight-card">
                  <span className="breed-highlight-icon" aria-hidden="true">{fact.icon}</span>
                  <dt className="breed-highlight-label">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ) : null}

      {slug === "christian" && authorProfile ? (
        <section className="content-section">
          <AuthorProfileFacts profile={authorProfile} />
        </section>
      ) : null}

      {breedPage && breedSections.length ? (
        <nav className="content-section content-section-tight breed-jump-nav-wrap" aria-label={`Inhalt: ${breedName}`}>
          <div className="breed-jump-nav">
            <span className="breed-jump-title">Inhalt</span>
            <a className="breed-jump-link breed-jump-link-primary" href="#steckbrief">Steckbrief</a>
            {breedSections.map((section) => (
              <a key={section.id} className="breed-jump-link" href={`#${section.id}`} title={section.label}>
                {section.label}
              </a>
            ))}
            {faqItems.length ? <a className="breed-jump-link" href="#faq">FAQ</a> : null}
          </div>
        </nav>
      ) : null}

      {hub ? null : (
        <section className="content-section magazine-mobile-conversion">
          <MagazineConversionRail title={entry.title} variant={sidebarVariant} />
        </section>
      )}

      {/* Im neuen Hero stehen Thema und Breadcrumb schon oben – Chips nur, wenn es mehr zu zeigen gibt */}
      {entry.categories.length && (breedPage || entry.categories.length > 1) ? (
        <section className={`content-section${breedPage ? " content-section-tight" : ""}`}>
          <div className="chip-row">
            {entry.categories.map((category) => (
              <Link key={category.slug} className="chip" href={`/magazin/thema/${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Übersichtsseiten ohne Sidebar: kurzes Intro neben langer Sidebar hinterlässt sonst eine große Lücke */}
      {hub ? (
        <section className="content-section">
          <section className="rich-content">
            <div dangerouslySetInnerHTML={{ __html: hub.before }} />
          </section>
        </section>
      ) : (
      <section className="content-section magazine-detail-content-section">
        <div className="magazine-detail-layout">
          <div className="magazine-detail-main">
            <section className={`rich-content${breedPage ? " breed-rich-content" : ""}`}>
              <div dangerouslySetInnerHTML={{ __html: schemaDedupedContent }} />
            </section>
          </div>
          <aside className="magazine-detail-side" aria-label="Singlebörse und Conversion-Module">
            <MagazineConversionRail title={entry.title} variant={sidebarVariant} showRadar />
          </aside>
        </div>
      </section>
      )}

      {hub && hubEntries ? (
        <section className="content-section">
          <MagazineHubGrid
            links={hub.links}
            entries={hubEntries}
            title={decodeHtmlEntities(entry.title)}
            emoji={HUB_EMOJI[magazineAnimal] ?? "🐾"}
            promo={{
              href: "https://tierisch-verliebt.de/?AID=magazin",
              image: staticAsset(sidebarVariant.image),
              imageAlt: sidebarVariant.imageAlt,
              audience: sidebarVariant.audience,
            }}
          />
        </section>
      ) : null}

      {hub && stripHtml(hub.after) ? (
        <section className="content-section">
          <section className="rich-content">
            <div dangerouslySetInnerHTML={{ __html: hub.after }} />
          </section>
        </section>
      ) : null}

      {/* Mobil ohne Sidebar: Radar nach dem Artikel statt davor, damit der Inhalt oben bleibt */}
      <section className="content-section magazine-mobile-conversion magazine-mobile-radar">
        <MagazineRadarCard />
      </section>

      {authorProfile && slug !== "christian" ? (
        <section className="content-section">
          <ExpertTrustCard
            profile={authorProfile}
            variant="compact"
            eyebrow={authorProfile.slug === "christian-m-haas" ? "Unser Datingexperte" : "Magazin-Autor"}
            primaryLabel={`Mehr über ${authorProfile.name}`}
          />
        </section>
      ) : null}
      </div>
    </main>
  );
}
