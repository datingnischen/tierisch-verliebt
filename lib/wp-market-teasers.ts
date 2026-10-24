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

function buildMarketSource(market: MarketTeaserCode): WpSource {
    const posts = (market === "ch" ? getChArticles() : getAtArticles()).map((article, index): WpPost => {
      const id = (market === "ch" ? 930_001 : 940_001) + index;
      const date = `${article.published}T12:00:00`;
      const dateGmt = berlinToUtc(date);
      const modified = `${article.updated}T12:00:00`;
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
