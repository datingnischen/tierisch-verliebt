import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { imageSize } from "../scripts/magazin-bildmasse.mjs";
import { handleWpRest } from "../lib/wp-rest-compat.ts";
import { MARKET_TEASER_PARAM, loadMarketTeaserSource, marketTeaserSourceFor } from "../lib/wp-market-teasers.ts";
import { teaserImagePath } from "../lib/teaser-image.ts";
import { proxy } from "../proxy.ts";
const root = new URL("../", import.meta.url);

test("AT und CH haben getrennte Artikel- und Medien-IDs", () => {
  const at = loadMarketTeaserSource("at");
  const ch = loadMarketTeaserSource("ch");
  for (const post of at.posts) {
    assert.equal(ch.posts.some(other => other.id === post.id || other.media.id === post.media.id), false);
  }
});

test("Route: tv_market wählt den Länderknoten und wird aus den Parametern entfernt; sonst .de-Magazin", () => {
  const params = new URLSearchParams(`per_page=3&${MARKET_TEASER_PARAM}=ch`);
  const source = marketTeaserSourceFor(params);
  assert.equal(source.posts[0].slug, "erstes-date-mit-hund");
  assert.equal(params.has(MARKET_TEASER_PARAM), false);
  assert.equal(marketTeaserSourceFor(new URLSearchParams("per_page=3")), undefined);
  assert.equal(marketTeaserSourceFor(new URLSearchParams(`${MARKET_TEASER_PARAM}=nl`)), undefined);
  // .de unverändert: Magazinbeiträge mit Links ins .de-Magazin
  const de = handleWpRest("/wp/v2/posts", new URLSearchParams("per_page=3"), marketTeaserSourceFor(new URLSearchParams("per_page=3")));
  for (const post of de.body) assert.match(post.link, /^https:\/\/tierisch-verliebt\.de\/magazin\//);
});

test("CH-Plattform bekommt drei Schweizer Magazinartikel mit fotorealistischen JPEG-Covern", () => {
  const result = handleWpRest("/wp/v2/posts/", new URLSearchParams("per_page=3&_embed=1"), loadMarketTeaserSource("ch"));
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.map(post => post.slug).sort(), ["erstes-date-mit-hund", "neuer-partner-und-katze", "zwei-singles-zwei-hunde"].sort());
  for (const post of result.body) {
    assert.equal(post.link, `https://tierisch-verliebt.ch/magazin/${post.slug}/`);
    const [media] = post._embedded["wp:featuredmedia"];
    assert.equal(media.source_url, `https://tierisch-verliebt.ch/magazin/wp-json/datingnischen/v1/bild/magazin/media/ch/${post.slug}-foto~jpg`);
    assert.deepEqual(imageSize(readFileSync(new URL(`public/magazin/media/ch/${post.slug}-foto.jpg`, root))), [1200, 800]);
    assert.deepEqual([media.media_details.width, media.media_details.height], [1200, 800]);
    assert.equal(teaserImagePath(["datingnischen", "v1", "bild", "magazin", "media", "ch", `${post.slug}-foto~jpg`]), `/magazin/media/ch/${post.slug}-foto.jpg`);
  }
});

const rewrite = (url, headers = {}) => {
  const response = proxy(new NextRequest(url, { headers }));
  assert.equal(response.status, 200, url);
  assert.equal(response.headers.get("location"), null, url);
  return new URL(response.headers.get("x-middleware-rewrite") || "about:blank");
};

test("REST-Markt wird zusätzlich als vertrauenswürdiger Request-Header übertragen", () => {
  for (const [path, market] of [["/ch/magazin/wp-json/wp/v2/posts", "ch"], ["/de/magazin/wp-json/wp/v2/posts", "de"]]) {
    const response = proxy(new NextRequest(`https://tierisch-verliebt.vercel.app${path}`, { headers: { "x-tv-rest-market": "at" } }));
    assert.equal(response.headers.get("x-middleware-request-x-tv-rest-market"), market);
  }
});

test("proxy: nginx-Upstream /at|/ch/… und Landesdomain landen beim Endpunkt mit tv_market, auch mit Slash, ?_embed ohne Wert und ?rest_route", () => {
  for (const market of ["at", "ch"]) {
    for (const [url, path] of [
      [`https://tierisch-verliebt.vercel.app/${market}/magazin/wp-json/wp/v2/posts?per_page=3&_embed`, "/magazin/wp-json/wp/v2/posts"],
      [`https://tierisch-verliebt.vercel.app/${market}/magazin/wp-json/wp/v2/posts/?per_page=3&_embed`, "/magazin/wp-json/wp/v2/posts/"],
      [`https://tierisch-verliebt.vercel.app/${market}/magazin/?rest_route=/wp/v2/posts&per_page=3&_embed`, "/magazin/index.php"],
      [`https://tierisch-verliebt.vercel.app/${market}/magazin/index.php?rest_route=/wp/v2/posts&_embed`, "/magazin/index.php"],
      [`https://tierisch-verliebt.${market}/magazin/wp-json/wp/v2/posts?per_page=3&_embed`, "/magazin/wp-json/wp/v2/posts"],
      [`https://tierisch-verliebt.${market}/magazin/?rest_route=/wp/v2/posts&_embed`, "/magazin/index.php"],
    ]) {
      const target = rewrite(url);
      assert.equal(target.pathname, path, url);
      assert.equal(target.searchParams.get(MARKET_TEASER_PARAM), market, url);
      assert.equal(target.searchParams.get("_embed"), "1", url);
      if (path.endsWith("index.php")) assert.equal(target.searchParams.get("rest_route"), "/wp/v2/posts", url);
    }
    // Bildroute ebenfalls ohne Umleitung und ohne Präfix
    const image = rewrite(`https://tierisch-verliebt.vercel.app/${market}/magazin/wp-json/datingnischen/v1/bild/cities/${market}/x~jpg`);
    assert.equal(image.pathname, `/magazin/wp-json/datingnischen/v1/bild/cities/${market}/x~jpg`);
  }
});

test("proxy: .de bleibt beim Magazin, ein von außen gesetzter tv_market wird mit de überschrieben", () => {
  for (const url of [
    `https://tierisch-verliebt.vercel.app/de/magazin/wp-json/wp/v2/posts?per_page=3&${MARKET_TEASER_PARAM}=at`,
    `https://tierisch-verliebt.vercel.app/magazin/wp-json/wp/v2/posts?per_page=3&${MARKET_TEASER_PARAM}=at`,
    `https://tierisch-verliebt.de/magazin/wp-json/wp/v2/posts?per_page=3&${MARKET_TEASER_PARAM}=ch`,
    `https://tierisch-verliebt.de/magazin/?rest_route=/wp/v2/posts&${MARKET_TEASER_PARAM}=ch`,
  ]) {
    const target = rewrite(url);
    // Vercel übernimmt beim Rewrite die Originalparameter: überschreiben statt entfernen.
    assert.deepEqual(target.searchParams.getAll(MARKET_TEASER_PARAM), ["de"], url);
    assert.doesNotMatch(target.pathname, /^\/(?:de|at|ch)\//, url);
  }
  const plain = rewrite("https://tierisch-verliebt.vercel.app/de/magazin/wp-json/wp/v2/posts?per_page=3");
  assert.equal(plain.search, "?per_page=3");
});
