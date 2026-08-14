import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { getAuthorProfile } from "@/lib/author-profiles";
import { staticAsset } from "@/lib/static-asset";
import { SITE_URL, decodeHtmlEntities, formatGermanDate, getMagazineEntryBySlug, stripHtml } from "@/lib/wordpress";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type BreedSectionLink = { id: string; label: string };

export const revalidate = 300;

const ONLINE_IFRAME_SRC = "https://js.icony.com/frame/?w=300&h=300&id=tierischverliebt&pc=c02e2e&aid=magazin";
const MAGAZINE_CTA_IMAGE = staticAsset("/home/frontpage-visual-tierischverliebt.webp");
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

function buildFaqMarkup(source: string) {
  const items = [...source.matchAll(/<h3>([\s\S]*?)<\/h3>\s*([\s\S]*?)(?=<h3>|$)/gi)]
    .map((match, index) => ({
      question: decodeHtmlEntities(stripHtml(match[1])),
      answer: match[2].trim(),
      open: index === 0,
    }))
    .filter((item) => item.question && item.answer);

  if (!items.length) return source;

  return [
    '<section class="breed-faq-card">',
    '  <div class="breed-faq-header">',
    '    <span class="eyebrow eyebrow-brand">FAQ</span>',
    '    <h2 id="faq" class="breed-section-title breed-section-title-inline">Häufige Fragen zum Barsoi</h2>',
    '    <p>Die häufigsten Fragen zur Haltung, Pflege und Beschäftigung des Barsoi kompakt beantwortet.</p>',
    '  </div>',
    '  <div class="breed-faq-list">',
    ...items.map((item) => [
      `    <details class="breed-faq-item"${item.open ? " open" : ""}>`,
      `      <summary>${item.question}</summary>`,
      `      <div class="breed-faq-answer">${item.answer}</div>`,
      '    </details>',
    ].join("\n")),
    '  </div>',
    '</section>',
  ].join("\n");
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
  next = next.replace(/<h2 id="faq" class="breed-section-title">FAQ<\/h2>([\s\S]*)$/i, (_match, faqContent: string) => buildFaqMarkup(faqContent));

  return next;
}

function MagazineConversionRail({ title }: { title: string }) {
  return (
    <div className="magazine-conversion-rail">
      <div className="magazine-conversion-card magazine-conversion-card-primary magazine-conversion-card-banner">
        <figure className="magazine-conversion-hero">
          <img src={MAGAZINE_CTA_IMAGE} alt="Tierisch verliebt – tierliebe Singles kennenlernen" loading="lazy" decoding="async" />
        </figure>
        <span className="eyebrow eyebrow-brand">Singlebörse</span>
        <h2>Tierliebe Singles statt nur weiterlesen</h2>
        <p>
          Wer bei {title} landet, sucht oft mehr als Infos — nämlich Menschen mit derselben Liebe zu Hund, Katze und Co.
        </p>
        <div className="magazine-conversion-points" aria-label="Einstiegsvorteile">
          <span>Kostenlos starten</span>
          <span>Tierliebe Singles</span>
          <span>Direkter Einstieg</span>
        </div>
        <div className="button-row">
          <Link className="button button-primary" href="https://tierisch-verliebt.de/?AID=magazin">
            Kostenlos registrieren
          </Link>
        </div>
      </div>

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

      <div className="magazine-conversion-card">
        <span className="eyebrow eyebrow-muted">Warum hier?</span>
        <h3>Gute Gründe für den Einstieg</h3>
        <ul className="trust-points" aria-label="Vorteile der Singlebörse">
          <li>Singles mit echter Tierliebe statt austauschbaren Flirts</li>
          <li>Direkter Einstieg aus Magazin, Tierwelt und Ratgeber</li>
          <li>Kostenlos starten und passende Kontakte entdecken</li>
        </ul>
        <Link className="magazine-conversion-link" href="https://tierisch-verliebt.de/?AID=magazin">
          Jetzt Singles entdecken
        </Link>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getMagazineEntryBySlug(slug);
  if (!entry) return {};

  const description = slug === "christian" ? CHRISTIAN_PAGE_DESCRIPTION : stripHtml(entry.excerpt || entry.content).slice(0, 155);

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
  const renderedContent = breedPage ? enhanceBreedContent(entry.content) : entry.content;
  const breedFacts = breedPage ? getBreedFacts(entry.content) : [];
  const breedSections = breedPage ? getBreedSectionLinks(entry.content) : [];
  const isChristianPage = slug === "christian";
  const christianStructuredData = isChristianPage
    ? [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Magazin", item: `${SITE_URL}/magazin` },
            { "@type": "ListItem", position: 2, name: entry.title, item: `${SITE_URL}/magazin/christian` },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Christian M. Haas",
          url: `${SITE_URL}/magazin/christian`,
          description: CHRISTIAN_PAGE_DESCRIPTION,
          jobTitle: "Gründer von tierisch-verliebt.de, Datingexperte und Tierliebhaber",
          image: authorProfile?.imageUrl || entry.featuredImage || undefined,
          sameAs: ["https://datingnischen.de/christian", "https://www.linkedin.com/in/christian-m-haas-457323379"],
          knowsAbout: ["Online-Dating", "tierfreundliche Partnersuche", "Haustiere im Alltag", "Dating-Communities"],
        },
      ]
    : [];

  return (
    <main className={`shell shell-narrow magazine-detail-shell${breedPage ? " breed-detail-shell" : ""}`}>
      {christianStructuredData.map((payload) => (
        <script
          key={payload["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
        />
      ))}
      <section className={`hero-card hero-magazine${breedPage ? " hero-magazine-breed" : ""}`}>
        <span className="eyebrow">{entry.type === "post" ? "Magazin-Artikel" : "Magazin-Seite"}</span>
        <h1>{entry.title}</h1>
        <p>{stripHtml(entry.excerpt || entry.content).slice(0, 220)}…</p>
        <div className="meta-row">
          {entry.authorName ? (
            <span>
              Von {authorProfile ? <Link href={authorProfile.profileUrl}>{entry.authorName}</Link> : entry.authorName}
            </span>
          ) : null}
          {entry.date ? <span>{formatGermanDate(entry.date)}</span> : null}
          <Link href="https://tierisch-verliebt.de/?AID=magazin">Kostenlos registrieren</Link>
        </div>
      </section>

      {entry.featuredImage ? (
        <section className={`content-section${breedPage ? " content-section-featured" : ""}`}>
          <figure className={`article-hero-media${breedPage ? " article-hero-media-breed" : ""}`}>
            <img src={entry.featuredImage} alt={entry.featuredImageAlt || entry.title} loading="eager" decoding="async" />
          </figure>
        </section>
      ) : null}

      <section className="content-section magazine-mobile-conversion">
        <MagazineConversionRail title={entry.title} />
      </section>

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
            <a className="breed-jump-link" href="#faq">FAQ</a>
          </div>
        </section>
      ) : null}

      <section className="content-section magazine-detail-content-section">
        <div className="magazine-detail-layout">
          <div className="magazine-detail-main">
            <section className={`rich-content${breedPage ? " breed-rich-content" : ""}`}>
              <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
            </section>
          </div>
          <aside className="magazine-detail-side" aria-label="Singlebörse und Conversion-Module">
            <MagazineConversionRail title={entry.title} />
          </aside>
        </div>
      </section>

      {authorProfile ? (
        <section className="content-section">
          <ExpertTrustCard
            profile={authorProfile}
            eyebrow={authorProfile.slug === "christian-m-haas" ? "Unser Datingexperte" : "Magazin-Autor"}
            title={
              authorProfile.slug === "christian-m-haas"
                ? "Hinter den Inhalten steht ein reales Profil mit Dating-Erfahrung, Tierliebe und langjähriger Magazinbegleitung."
                : `Dieser Beitrag wurde von ${authorProfile.name} für das Tier-Magazin zusammengestellt.`
            }
            primaryLabel={authorProfile.slug === "christian-m-haas" ? "Zum Expertenprofil" : "Zum Autorenprofil"}
          />
        </section>
      ) : null}
    </main>
  );
}
