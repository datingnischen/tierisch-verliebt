import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorProfileFacts } from "@/components/author-profile-facts";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { MagazineHubGrid } from "@/components/magazine-hub-grid";
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
import { buildChristianBookProfileGraph, stripPublishedBookSchema } from "@/lib/christian-book-profile-schema";
import { buildMagazineFaqGraph, getMagazineFaqItems, getMagazineFaqSubject, renderMagazineFaqSection } from "@/lib/magazine-faq";
import { serializeJsonLd } from "@/lib/json-ld";
import { buildMagazineArticleGraph } from "@/lib/site-entities";
import { detectMagazineAnimal, getMagazineSidebarVariant, type MagazineSidebarVariant } from "@/lib/magazine-animal";
import { splitHubLinkList } from "@/lib/magazine-hub";
import { extractLeadImage } from "@/lib/magazine-lead-image";
import { findTierwelt } from "@/lib/tierwelten";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type BreedSectionLink = { id: string; label: string };

export const revalidate = 300;

const ONLINE_IFRAME_SRC = "https://js.icony.com/frame/?w=300&h=300&id=tierischverliebt&pc=c02e2e&aid=magazin";
const UNLISTED_CATEGORY_SLUGS = new Set(["allgemein", "uncategorized"]);
const CHRISTIAN_PAGE_DESCRIPTION =
  "Christian M. Haas ist Gründer von tierisch-verliebt.de, Datingexperte und Tierliebhaber. Erfahre mehr über seine Tierverbundenheit, Dating-Erfahrung und redaktionellen Schwerpunkte.";

function isBreedProfile(html: string) {
  return /<p>\s*<strong>\s*Steckbrief\s*<\/strong>\s*<\/p>\s*<ul>/i.test(html);
}

function slugifyHeading(text: string) {
  return stripHtml(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "abschnitt";
}

function getBreedFacts(html: string) {
  const match = html.match(/<p>\s*<strong>\s*Steckbrief\s*<\/strong>\s*<\/p>\s*<ul>([\s\S]*?)<\/ul>/i);
  if (!match) return [] as string[];

  return [...match[1].matchAll(/<li>([\s\S]*?)<\/li>/gi)]
    .map((item) => decodeHtmlEntities(stripHtml(item[1])))
    .filter(Boolean);
}

function getBreedSectionLinks(html: string): BreedSectionLink[] {
  const links = [...html.matchAll(/<h2>([\s\S]*?)<\/h2>/gi)]
    .map((match) => decodeHtmlEntities(stripHtml(match[1])))
    .filter((label) => label && label.toLowerCase() !== "faq")
    .map((label) => ({ id: slugifyHeading(label), label }));

  return links.filter((link, index, all) => all.findIndex((entry) => entry.id === link.id) === index);
}

function enhanceBreedContent(html: string) {
  let next = html.replace(/<p>\s*<strong>\s*Steckbrief\s*<\/strong>\s*<\/p>\s*(<ul>[\s\S]*?<\/ul>)/i, (_match, listHtml: string) => {
    const list = listHtml
      .replace(/^<ul>/i, '<ul class="breed-facts-list">')
      .replace(/<li>([\s\S]*?)<\/li>/gi, '<li><span class="breed-facts-paw" aria-hidden="true">🐾</span><span class="breed-facts-copy">$1</span></li>');

    return [
      '<section class="breed-facts-card">',
      '  <div class="breed-facts-header">',
      '    <span class="eyebrow eyebrow-brand">Steckbrief</span>',
      '    <h2>Steckbrief auf einen Blick</h2>',
      '    <p>Die wichtigsten Rassemerkmale kompakt zusammengefasst — warm, schnell erfassbar und mit etwas mehr Charakter als eine einfache Standardliste.</p>',
      '  </div>',
      `  ${list}`,
      '</section>',
    ].join("");
  });

  next = next.replace(/<p>\s*(<img[\s\S]*?>)\s*<\/p>/gi, '<figure class="breed-inline-media">$1</figure>');
  next = next.replace(/<h2>([\s\S]*?)<\/h2>/gi, (_match, headingHtml: string) => {
    const headingText = decodeHtmlEntities(stripHtml(headingHtml));
    const id = slugifyHeading(headingText);
    return `<h2 id="${id}" class="breed-section-title">${headingHtml}</h2>`;
  });

  return next;
}

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

function entryDescription(slug: string, entry: MagazineEntry) {
  return slug === "christian" ? CHRISTIAN_PAGE_DESCRIPTION : stripHtml(entry.excerpt || entry.content).slice(0, 155);
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
      canonical: `${SITE_URL}/magazin/${slug}`,
    },
    openGraph: {
      title: entry.title,
      description,
      url: `${SITE_URL}/magazin/${slug}`,
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
  const breedPage = isBreedProfile(entry.content);
  // Ohne Beitragsbild wird ein Bild ganz am Anfang des Inhalts zum Artikelbild (z. B. Apps-Beiträge).
  const leadImage = entry.featuredImage ? null : extractLeadImage(entry.content);
  const heroImage = entry.featuredImage
    ? { src: entry.featuredImage, alt: entry.featuredImageAlt || entry.title }
    : leadImage
      ? { src: leadImage.image.src, alt: leadImage.image.alt || entry.title }
      : null;
  const bodyContent = leadImage ? leadImage.content : entry.content;
  const enhancedContent = breedPage ? enhanceBreedContent(bodyContent) : bodyContent;
  const faqItems = getMagazineFaqItems(entry.content);
  const renderedContent = renderMagazineFaqSection(enhancedContent, getMagazineFaqSubject(entry.title));
  const schemaDedupedContent = relativizeInternalLinks(stripPublishedBookSchema(renderedContent));
  const breedFacts = breedPage ? getBreedFacts(entry.content) : [];
  const breedSections = breedPage ? getBreedSectionLinks(entry.content) : [];
  const profileGraph = buildChristianBookProfileGraph({
    slug,
    christianSlug: "christian",
    content: entry.content,
    canonicalUrl: `${SITE_URL}/magazin/christian`,
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
      { name: "Magazin", url: `${SITE_URL}/magazin` },
      { name: "Christian M. Haas", url: `${SITE_URL}/magazin/christian` },
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
          url: `${SITE_URL}/magazin/${slug}`,
          type: entry.type,
          headline: decodeHtmlEntities(entry.title),
          description: entryDescription(slug, entry),
          image: heroImage && /^https?:\/\//.test(heroImage.src) ? heroImage.src : undefined,
          datePublished: entry.date,
          dateModified: entry.modified,
          author: entry.authorName
            ? {
                name: authorProfile?.name || entry.authorName,
                url: authorProfile ? `${SITE_URL}${authorProfile.profileUrl}` : undefined,
              }
            : undefined,
          category: articleCategory
            ? { name: decodeHtmlEntities(articleCategory.name), url: `${SITE_URL}/magazin/thema/${articleCategory.slug}` }
            : undefined,
        });
  const faqGraph = buildMagazineFaqGraph({
    items: faqItems,
    pageUrl: `${SITE_URL}/magazin/${slug}`,
    pageName: `Häufige Fragen zu ${decodeHtmlEntities(entry.title)}`,
  });

  return (
    <main className={`shell shell-narrow magazine-detail-shell${breedPage ? " breed-detail-shell" : ""}`}>
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
      <section className={`hero-card hero-magazine${breedPage ? " hero-magazine-breed" : ""}`}>
        <span className="eyebrow">{entry.type === "post" ? "Magazin-Artikel" : "Magazin-Seite"}</span>
        <h1>{entry.title}</h1>
        <p>{slug === "christian" ? CHRISTIAN_PAGE_DESCRIPTION : `${stripHtml(entry.excerpt || entry.content).slice(0, 220)}…`}</p>
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
      </section>

      {slug === "christian" && authorProfile ? (
        <section className="content-section">
          <AuthorProfileFacts profile={authorProfile} />
        </section>
      ) : null}

      {heroImage ? (
        <section className={`content-section${breedPage ? " content-section-featured" : ""}`}>
          <figure className={`article-hero-media${breedPage ? " article-hero-media-breed" : ""}`}>
            <img src={heroImage.src} alt={heroImage.alt} loading="eager" decoding="async" />
          </figure>
        </section>
      ) : null}

      {hub ? null : (
        <section className="content-section magazine-mobile-conversion">
          <MagazineConversionRail title={entry.title} variant={sidebarVariant} />
        </section>
      )}

      {breedPage && breedFacts.length ? (
        <section className="content-section content-section-tight">
          <div className="breed-highlight-grid" aria-label="Schnelle Rasseinfos">
            {breedFacts.slice(0, 4).map((fact) => {
              const [label, ...valueParts] = fact.split(":");
              return (
                <article key={fact} className="breed-highlight-card">
                  <span className="breed-highlight-label">{label}</span>
                  <strong>{valueParts.join(":").trim() || label}</strong>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {entry.categories.length ? (
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

      {breedPage && breedSections.length ? (
        <section className="content-section content-section-tight">
          <div className="breed-jump-nav" aria-label="Direkt zu den wichtigsten Abschnitten">
            {breedSections.map((section) => (
              <a key={section.id} className="breed-jump-link" href={`#${section.id}`}>
                {section.label}
              </a>
            ))}
            {faqItems.length ? <a className="breed-jump-link" href="#faq">FAQ</a> : null}
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
    </main>
  );
}
