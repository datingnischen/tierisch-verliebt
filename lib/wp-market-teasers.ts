import data from "../data/partnersuche-markets.json" with { type: "json" };
import { publicUrl } from "#markets";
import { teaserImageUrl } from "#teaser-image";
import type { WpMedia, WpPost, WpSource } from "./wp-rest-compat.ts";
import { MARKET_TEASER_PARAM } from "#wp-rest-paths";

/**
 * AT/CH-Knoten der WordPress-kompatiblen Schnittstelle (https://tierisch-verliebt.at|ch/magazin/wp-json/wp/v2/posts).
 *
 * Hintergrund (Heiko, 2026-10-20): Die .at/.ch-Startseiten von ICONY holten ihre drei Magazin-Teaser von der
 * .de-Schnittstelle. Die Bilder kamen dann von tierisch-verliebt.de, die CSP der ICONY-Startseiten (`img-src 'self'`)
 * blockte sie, und die Links führten ins .de-Magazin. Ein eigenes Magazin je Land gibt es nicht. Der Länderknoten
 * liefert darum die drei größten Städteseiten des Landes (nach Einwohnern) als „Beiträge“: Link, Bild und Text auf
 * der Landesdomain. Die Bilder liegen als Kopie unter public/cities/<land>/ (Original: ICONY-CMS der Stadtseite).
 *
 * proxy.ts hängt dafür den Query-Parameter tv_market=at|ch an (Query statt Header, damit der CDN-Cache die Länder
 * getrennt hält); die Routen lesen ihn mit marketTeaserSourceFor().
 */

export { MARKET_TEASER_PARAM };
export type MarketTeaserCode = "at" | "ch";

type CityPage = { slug: string; path: string; title: string; description: string; cityName: string };

// Größte Städte nach Einwohnern mit Stadtseite und Bild; Maße der Dateien in public/cities/<land>/<slug>.jpg.
export const TEASER_CITIES: Record<MarketTeaserCode, { slug: string; width: number; height: number }[]> = {
  at: [
    { slug: "wien", width: 1000, height: 666 },
    { slug: "graz", width: 1000, height: 666 },
    { slug: "linz", width: 1000, height: 518 },
  ],
  ch: [
    { slug: "zuerich", width: 1000, height: 750 },
    { slug: "genf", width: 1000, height: 563 },
    { slug: "basel", width: 1000, height: 714 },
  ],
};

// Feste Datumswerte: Reihenfolge = Einwohnerzahl (neuester „Beitrag“ zuerst, ICONY sortiert nach Datum).
const DATES = ["2026-10-20T12:00:00", "2026-10-20T11:00:00", "2026-10-20T10:00:00"];
// *_gmt wie bei WordPress in UTC (am 20.10.2026 gilt in Europe/Berlin noch Sommerzeit, UTC+2).
const DATES_GMT = ["2026-10-20T10:00:00", "2026-10-20T09:00:00", "2026-10-20T08:00:00"];
const ID_BASE: Record<MarketTeaserCode, number> = { at: 910_000, ch: 920_000 };
const MEDIA_ID_OFFSET = 1_000_000;

export function isMarketTeaserCode(value: unknown): value is MarketTeaserCode {
  return value === "at" || value === "ch";
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Die importierten Meta-Descriptions enden teils mit Floskeln („Lesen Sie weiter hier.“) – im Teaser ohne.
const cleanExcerpt = (value: string) => value.replace(/\s*(?:Lesen Sie w(?:e)?iter hier|Hier finden Sie weitere Informationen)\.?\s*$/i, "").trim();

function buildMarketSource(market: MarketTeaserCode): WpSource {
  const pages = (data as unknown as Record<string, { pages: CityPage[] }>)[market].pages;
  const restRoot = publicUrl(market, "/magazin/wp-json");
  const posts = TEASER_CITIES[market].map((teaser, index): WpPost => {
    const page = pages.find((item) => item.slug === teaser.slug);
    if (!page) throw new Error(`Stadtseite ${market}/${teaser.slug} fehlt in data/partnersuche-markets.json`);
    const id = ID_BASE[market] + index + 1;
    const date = DATES[index];
    const dateGmt = DATES_GMT[index];
    const file = `cities/${market}/${teaser.slug}.jpg`;
    const alt = `Partnersuche für Tierfreunde in ${page.cityName}`;
    const media: WpMedia = {
      id: MEDIA_ID_OFFSET + id,
      slug: `${market}-${teaser.slug}`,
      title: escapeHtml(alt),
      date,
      dateGmt,
      modified: date,
      modifiedGmt: dateGmt,
      author: 1,
      post: id,
      alt,
      url: teaserImageUrl(restRoot, `/${file}`),
      file,
      mime: "image/jpeg",
      width: teaser.width,
      height: teaser.height,
    };
    const excerpt = `<p>${escapeHtml(cleanExcerpt(page.description))}</p>\n`;
    return {
      id,
      slug: teaser.slug,
      date,
      dateGmt,
      modified: date,
      modifiedGmt: dateGmt,
      title: escapeHtml(page.title),
      content: excerpt,
      excerpt,
      author: 1,
      categories: [],
      media,
      link: publicUrl(market, `/partnersuche/${teaser.slug}`),
    };
  });
  return { posts, categories: [] };
}

const cached = new Map<MarketTeaserCode, WpSource>();

export function loadMarketTeaserSource(market: MarketTeaserCode): WpSource {
  const hit = cached.get(market);
  if (hit) return hit;
  const source = buildMarketSource(market);
  if (process.env.NODE_ENV === "production") cached.set(market, source);
  return source;
}

/** Quelle für eine Anfrage: Länderknoten bei tv_market=at|ch, sonst undefined (= deutsche Magazinbeiträge). Entfernt den Parameter. */
export function marketTeaserSourceFor(params: URLSearchParams): WpSource | undefined {
  const market = params.get(MARKET_TEASER_PARAM);
  params.delete(MARKET_TEASER_PARAM);
  return isMarketTeaserCode(market) ? loadMarketTeaserSource(market) : undefined;
}
