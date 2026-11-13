import { publicUrl } from "#markets";
import { teaserImageUrl } from "#teaser-image";
import { getChArticles } from "#ch-magazine";
import { getAtArticles } from "#at-magazine";
import { berlinToUtc } from "#wp-rest-compat";
import type { WpPost, WpSource } from "./wp-rest-compat.ts";
import { MARKET_TEASER_PARAM } from "#wp-rest-paths";

// ICONY-Startseiten bekommen ausschließlich eigene Magazinartikel des jeweiligen Landes.
// Bilder bleiben über die endungslose REST-Bildroute auf der Landesdomain (CSP).
export { MARKET_TEASER_PARAM };
export type MarketTeaserCode = "at" | "ch";
const MEDIA_ID_OFFSET = 1_000_000;
export function isMarketTeaserCode(value: unknown): value is MarketTeaserCode { return value === "at" || value === "ch"; }
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Artikel der Länder haben nur ein Datum (JJJJ-MM-TT). Statt einer festen Uhrzeit (früher immer 12:00:00) bekommt jeder
// Beitrag eine unregelmäßige, aber stabile Uhrzeit aus dem Slug (FNV-1a-Hash): tagsüber, Sekunde nie 0, nie in der Zukunft.
const HOURS = [8, 9, 9, 10, 10, 10, 11, 11, 13, 14, 14, 15, 15, 16, 16, 17, 18, 19, 19, 20, 20, 21];
function slugHash(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 0x01000193) >>> 0;
  return hash;
}
const pad = (value: number) => String(value).padStart(2, "0");
export function naturalLocalTime(day: string, key: string): string {
  if (day.includes("T")) return day.slice(0, 19);
  const hash = slugHash(key);
  let hour = HOURS[hash % HOURS.length];
  const minute = (hash >>> 8) % 60;
  const second = 1 + ((hash >>> 16) % 59);
  const nowBerlin = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin", dateStyle: "short", timeStyle: "medium" }).format(new Date()).replace(" ", "T");
  if (`${day}T${pad(hour)}:${pad(minute)}:${pad(second)}` > nowBerlin) hour = 7;
  return `${day}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

function buildMarketSource(market: MarketTeaserCode): WpSource {
    const posts = (market === "ch" ? getChArticles() : getAtArticles()).map((article, index): WpPost => {
      const id = (market === "ch" ? 930_001 : 940_001) + index;
      const date = naturalLocalTime(article.published, `${market}/${article.slug}`);
      const dateGmt = berlinToUtc(date);
      const modified = article.updated.slice(0, 10) === article.published.slice(0, 10) ? date : naturalLocalTime(article.updated, `${market}/${article.slug}/modified`);
      const modifiedGmt = berlinToUtc(modified);
      return {
        id, slug: article.slug, date, dateGmt, modified, modifiedGmt,
        title: escapeHtml(article.title), content: article.content,
        excerpt: `<p>${escapeHtml(article.teaser)}</p>\n`, author: 1, categories: [],
        link: publicUrl(market, `/magazin/${article.slug}`),
        media: {
          id: MEDIA_ID_OFFSET + id, slug: article.slug, title: escapeHtml(article.title),
          date, dateGmt, modified, modifiedGmt, author: 1, post: id, alt: article.imageAlt,
          url: teaserImageUrl(publicUrl(market, "/magazin/wp-json"), article.image),
          file: article.image.replace(/^\//, ""), mime: /\.jpe?g$/i.test(article.image) ? "image/jpeg" : "image/png", width: article.imageWidth, height: article.imageHeight,
        },
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
