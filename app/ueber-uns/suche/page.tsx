import { ABOUT_SEARCH_PATH } from "@/lib/about-section";
import type { Metadata } from "next";
import { AboutShell } from "@/components/about/about-shell";
import { AboutSearchForm } from "@/components/about-search-form";
import { MarketLink } from "@/components/market-link";
import {
  ABOUT_OVERVIEW_PATH,
  ABOUT_REVIEWS_PATH,
  ABOUT_SOCIAL_MEDIA_PATH,
  aboutSearchCanonical,
  canonicalMagazinePagePath,
} from "@/lib/about-section";
import { getMarketCityPages } from "@/lib/market-partnersuche";
import { getMarket, MARKET_CODES } from "@/lib/markets";
import { SEARCH_MAX_QUERY_LENGTH, searchDocuments, type SearchDocument } from "@/lib/site-search";
import { getMagazineCategories, getMagazinePages, getMagazinePosts, stripHtml } from "@/lib/wordpress";

type PageProps = { searchParams: Promise<{ q?: string | string[] }> };

const TITLE = "Suche im Magazin und in den Städten";
const DESCRIPTION =
  "Durchsuche das tierisch-verliebt Magazin, die Tierwelten-Themen und die Stadtseiten für Deutschland, Österreich und die Schweiz.";

// Suchseiten gehören nicht in den Index, ihre Links dürfen aber verfolgt werden.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  alternates: { canonical: aboutSearchCanonical() },
};

// „Unsere Geschichte“ kommt als WordPress-Seite (Slug ueber-uns) aus dem Magazin-Loader.
const ABOUT_DOCUMENTS: SearchDocument[] = [
  { section: "Über uns", title: "Über tierisch-verliebt", summary: "Wer hinter tierisch-verliebt steht, Presse, Sponsoring und Kanäle.", body: "", market: "de", path: ABOUT_OVERVIEW_PATH },
  { section: "Über uns", title: "Bewertungen und Erfahrungen", summary: "Was Mitglieder über tierisch-verliebt sagen.", body: "", market: "de", path: ABOUT_REVIEWS_PATH },
  { section: "Über uns", title: "Social Media", summary: "Die offiziellen Kanäle von tierisch-verliebt.", body: "", market: "de", path: ABOUT_SOCIAL_MEDIA_PATH },
];

async function loadMagazineDocuments(): Promise<SearchDocument[]> {
  // Gleiche gecachten Listen-Helfer wie Sitemap und Inhaltsverzeichnis – kein eigener Request pro Suche.
  try {
    const [posts, pages, categories] = await Promise.all([getMagazinePosts(), getMagazinePages(), getMagazineCategories()]);
    return [
      ...posts.map((post) => ({
        section: post.categories[0]?.name ? `Magazin · ${post.categories[0].name}` : "Magazin",
        title: post.title,
        summary: stripHtml(post.excerpt),
        body: stripHtml(post.content),
        market: "de" as const,
        path: `/magazin/${post.slug}`,
      })),
      ...pages.map((page) => ({
        section: page.slug === "ueber-uns" ? "Über uns" : "Magazin",
        title: page.title,
        summary: stripHtml(page.excerpt),
        body: stripHtml(page.content),
        market: "de" as const,
        path: canonicalMagazinePagePath(page.slug),
      })),
      ...categories.map((category) => ({
        section: "Thema",
        title: category.name,
        summary: category.description,
        body: "",
        market: "de" as const,
        path: `/magazin/thema/${category.slug}`,
      })),
    ];
  } catch (error) {
    console.error("Seitensuche: Magazin nicht erreichbar", error);
    return [];
  }
}

function loadCityDocuments(): SearchDocument[] {
  return MARKET_CODES.flatMap((market) =>
    getMarketCityPages(market).map((city) => ({
      section: market === "de" ? "Stadt" : `Stadt · ${getMarket(market).countryName}`,
      title: city.title || `Partnersuche in ${city.cityName}`,
      summary: city.description || stripHtml(city.lead),
      body: `${city.cityName} ${stripHtml(city.lead)} ${stripHtml(city.contentHtml)}`,
      market,
      path: city.path,
    })),
  );
}

export default async function AboutSearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (raw ?? "").trim().slice(0, SEARCH_MAX_QUERY_LENGTH);

  const results = query
    ? searchDocuments([...ABOUT_DOCUMENTS, ...(await loadMagazineDocuments()), ...loadCityDocuments()], query)
    : [];

  return (
    <AboutShell
      current={ABOUT_SEARCH_PATH}
      crumb="Suche"
      badge="Über uns · Suche"
      title={query ? `Suche nach „${query}“` : "Was suchst du?"}
      lead="Hier durchsuchst du unser Magazin mit Ratgebern und Rasseporträts sowie die Stadtseiten der Partnersuche in Deutschland, Österreich und der Schweiz."
    >
      <div className="tvc-wrap tva-body">
      <div className="tva-search">
        <AboutSearchForm query={query} autoFocus={!query} />
      </div>

      {!query ? (
        <section className="panel-card">
          <h2>Tipp für den Einstieg</h2>
          <p>
            Gib eine Tierart, eine Rasse, ein Thema oder deine Stadt ein – zum Beispiel „Hund“, „Maine Coon“,
            „erstes Date“ oder „Wien“.
          </p>
        </section>
      ) : results.length ? (
        <>
          <p className="about-search-count" aria-live="polite">
            {results.length === 1 ? "1 Treffer" : `${results.length} Treffer`}
            {results.length >= 50 ? " – die besten 50 werden angezeigt. Grenze die Suche gern weiter ein." : ""}
          </p>
          <ol className="about-search-results">
            {results.map((result) => (
              <li className="panel-card about-search-result" key={`${result.market}${result.path}`}>
                <span className="eyebrow">{result.section}</span>
                <h2>
                  <MarketLink market={result.market} path={result.path}>
                    {result.title}
                  </MarketLink>
                </h2>
                {result.snippet ? <p>{result.snippet}</p> : null}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <section className="panel-card">
          <h2>Dazu haben wir leider nichts gefunden</h2>
          <p>
            Probier es mit einem anderen oder kürzeren Begriff – etwa nur der Rasse oder dem Namen deiner Stadt. Alle
            Beiträge findest du auch im{" "}
            <MarketLink market="de" path="/magazin/inhalt">Inhaltsverzeichnis A–Z</MarketLink>, alle Städte in der{" "}
            <MarketLink market="de" path="/partnersuche">Partnersuche</MarketLink>.
          </p>
        </section>
      )}
      </div>
    </AboutShell>
  );
}
