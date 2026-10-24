import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketLink } from "@/components/market-link";
import { PreviewLinkRewriter } from "@/components/preview-link-rewriter";
import { display } from "@/components/city-page/display-font";
import { PawIcon } from "@/components/city-page/tier-icons";
import { getAtArticle, getAtArticles, atMagazineGraph, type AtArticle } from "@/lib/at-magazine";
import { publicUrl } from "@/lib/markets";
import { staticAsset } from "@/lib/static-asset";
import { serializeJsonLd } from "@/lib/json-ld";
import audioTexts from "@/docs/at-magazin-audio.json";
import "@/components/city-page/tier-city-page.css";
import "../../market-ch-magazin/[[...path]]/magazine.css";

type Props = { params: Promise<{ path?: string[] }> };
const TITLE = "Magazin für tierliebe Singles in Österreich";
const DESCRIPTION = "Dating mit Hund, Partnerschaft mit Katze und ein gemeinsamer Alltag mit Tieren: praktische Ratgeber für tierliebe Singles in Österreich.";

function resolve(parts: string[] = []) {
  if (!parts.length) return undefined;
  const article = parts.length === 1 ? getAtArticle(parts[0]) : null;
  if (!article) notFound();
  return article;
}

export function generateStaticParams() {
  return [{ path: [] }, ...getAtArticles().map(article => ({ path: [article.slug] }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = resolve((await params).path);
  const url = publicUrl("at", article ? `/magazin/${article.slug}` : "/magazin");
  return {
    title: { absolute: `${article?.seoTitle || TITLE} | tierisch-verliebt.at` },
    description: article?.description || DESCRIPTION,
    alternates: { canonical: url }, robots: { index: true, follow: true },
    openGraph: {
      title: article?.title || TITLE, description: article?.description || DESCRIPTION,
      url, locale: "de_AT", siteName: "tierisch-verliebt.at", type: article ? "article" : "website",
      images: article ? [{ url: staticAsset(article.image), width: article.imageWidth, height: article.imageHeight, alt: article.imageAlt }] : undefined,
      ...(article ? { publishedTime: article.published, modifiedTime: article.updated } : {}),
    },
  };
}

function ArticleCards({ articles }: { articles: AtArticle[] }) {
  return <div className="ch-cards">{articles.map((article, index) => <article className="ch-card" key={article.slug}>
    <MarketLink market="at" path={`/magazin/${article.slug}`} className="ch-card-image"><img src={staticAsset(article.image)} alt={article.imageAlt} width={1200} height={800} loading="lazy" /></MarketLink>
    <div className="ch-card-copy"><span className="ch-kicker">{String(index + 1).padStart(2, "0")} / {article.category}</span>
      <h3><MarketLink market="at" path={`/magazin/${article.slug}`}>{article.title}</MarketLink></h3>
      <p>{article.teaser}</p><span className="ch-card-bottom">{article.readingMinutes} Min. Lesezeit <span aria-hidden="true">↗</span></span>
    </div>
  </article>)}</div>;
}

function DatingCta() {
  return <section className="ch-cta" aria-labelledby="ch-cta-title"><span className="ch-kicker">Zusammen gehört auch dein Tier dazu</span>
    <h2 id="ch-cta-title">Jemanden kennenlernen, der das versteht.</h2><p>Auf tierisch-verliebt.at triffst du Menschen, für die Tiere zum Alltag gehören. Ein gemeinsames Thema für das erste Gespräch habt ihr schon.</p>
    <a className="tvc-btn tvc-btn-primary" href={publicUrl("at", "/registration/?AID=magazin")}>Kostenlos registrieren <span aria-hidden="true">→</span></a>
  </section>;
}

export default async function AtMagazine({ params }: Props) {
  const article = resolve((await params).path);
  const articles = getAtArticles();
  return <main className={`tvc ch-magazine ${display.variable}`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(atMagazineGraph(article)) }} />
    <section className="tvc-hero ch-hero"><div className={`tvc-wrap${article ? " ch-hero-grid" : ""}`}>
      <div><nav className="tvc-crumbs" aria-label="Brotkrümelnavigation"><MarketLink market="at">Start</MarketLink><span aria-hidden="true">›</span>{article ? <><MarketLink market="at" path="/magazin">Magazin</MarketLink><span aria-hidden="true">›</span><span>Ratgeber</span></> : <span>Magazin</span>}</nav>
        <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />{article?.category || "Das österreichische Magazin"}</span>
        <h1>{article?.title || <>Verliebt sein.<br />Mit Herz und Pfote.</>}</h1>
        <p className="tvc-lead">{article?.description || "Wenn aus deinem Alltag unser Alltag wird: Ideen fürs Kennenlernen, für eure Beziehung und für die Tiere, die dazugehören. Mit Blick auf das Leben in Österreich."}</p>
        {article ? <p className="ch-meta">Redaktion tierisch-verliebt.at · Aktualisiert am <time dateTime={article.updated}>{new Intl.DateTimeFormat("de-AT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Vienna" }).format(new Date(`${article.updated}T12:00:00Z`))}</time> · {article.readingMinutes} Min. Lesezeit</p> : <div className="ch-hero-tags"><a href="#beitraege">Unsere ersten drei Ratgeber <span aria-hidden="true">↓</span></a><span>Hund · Katze · Partnerschaft</span></div>}
      </div>
      {article ? <figure className="ch-hero-picture"><img src={staticAsset(article.image)} alt={article.imageAlt} width={1200} height={800} fetchPriority="high" /><figcaption>Symbolbild · tierisch-verliebt.at</figcaption></figure> : null}
    </div></section>
    <div className="tvc-wrap ch-body">
      {article ? <>
        <div className="ch-article-layout"><nav className="ch-toc" aria-label="Inhaltsverzeichnis"><span className="ch-kicker">In diesem Beitrag</span><ol>{article.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>)}</ol></nav>
          <article className="ch-prose" aria-label={article.title}>
            <section className="ch-audio" aria-label="Artikel als Audio-Kurzfassung">
              <span className="ch-kicker">Dein Ratgeber zum Anhören</span>
              <h2>Lieber zuhören?</h2>
              <p>Die wichtigsten Gedanken als Audio-Kurzfassung.</p>
              <audio controls preload="none" aria-label={`Audio-Kurzfassung: ${article.title}`}>
                <source src={staticAsset(`/magazin/media/at/${article.slug}-audio.mp3`)} type="audio/mpeg" />
                Dein Browser unterstützt den Audioplayer nicht. <a href={staticAsset(`/magazin/media/at/${article.slug}-audio.mp3`)}>MP3 öffnen</a>
              </audio>
              <details><summary>Hörtext lesen</summary><p>{audioTexts[article.slug as keyof typeof audioTexts]}</p></details>
            </section>
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </article>
        </div>
        <DatingCta />
        <section className="ch-more" aria-labelledby="ch-more-title"><span className="ch-kicker">Weiterlesen</span><h2 id="ch-more-title">Mehr Raum für euch und eure Tiere</h2><ArticleCards articles={articles.filter(entry => entry.slug !== article.slug)} /></section>
      </> : <>
        <section id="beitraege" aria-labelledby="ch-articles-title"><div className="ch-section-heading"><div><span className="ch-kicker">Kennenlernen & Zusammenleben</span><h2 id="ch-articles-title">Ein guter Anfang. Für alle.</h2></div><p>Drei Ratgeber für die Momente, in denen aus zwei Leben langsam eines wird.</p></div><ArticleCards articles={articles} /></section>
        <section className="ch-local" aria-labelledby="ch-local-title"><div><span className="ch-kicker">Bei dir in der Nähe</span><h2 id="ch-local-title">Die nächste gemeinsame Runde?</h2><p>Unsere österreichischen Stadtseiten geben dir Anregungen für Gassi-Runden und tierliebe Begegnungen. Wähle einen Ort, der zu euch und euren Tieren passt.</p></div><div className="ch-city-links">{[["wien", "Wien"], ["graz", "Graz"], ["salzburg", "Salzburg"]].map(([slug, name]) => <MarketLink market="at" path={`/partnersuche/${slug}`} key={slug}>{name} <span aria-hidden="true">↗</span></MarketLink>)}<MarketLink market="at" path="/partnersuche">Alle Städte <span aria-hidden="true">→</span></MarketLink></div></section>
        <DatingCta />
      </>}
    </div><PreviewLinkRewriter selector=".ch-prose" />
  </main>;
}
