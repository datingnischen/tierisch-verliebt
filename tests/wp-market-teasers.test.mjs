import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { imageSize } from "../scripts/magazin-bildmasse.mjs";
import { handleWpRest } from "../lib/wp-rest-compat.ts";
import { MARKET_TEASER_PARAM, TEASER_CITIES, loadMarketTeaserSource, marketTeaserSourceFor } from "../lib/wp-market-teasers.ts";
import { teaserImagePath } from "../lib/teaser-image.ts";
import { proxy } from "../proxy.ts";

// Heiko (2026-10-20): ICONY ruft für die .at/.ch-Startseiten https://tierisch-verliebt.at|ch/magazin/wp-json/wp/v2/posts
// auf. Ein Länder-Magazin gibt es nicht: Der Länderknoten liefert die drei größten Städteseiten des Landes.
const root = new URL("../", import.meta.url);
const EXPECTED = { at: ["wien", "graz", "linz"], ch: ["zuerich", "genf", "basel"] };

for (const [market, slugs] of Object.entries(EXPECTED)) {
  test(`${market}: drei größte Städteseiten im WordPress-Format, Link und Bild auf der Landesdomain`, () => {
    const result = handleWpRest("/wp/v2/posts/", new URLSearchParams("per_page=3&_embed=1"), loadMarketTeaserSource(market));
    assert.equal(result.status, 200);
    assert.equal(result.body.length, 3);
    assert.equal(result.headers["X-WP-Total"], "3");
    assert.deepEqual(result.body.map((post) => post.slug), slugs, "nach Einwohnern sortiert");
    for (const post of result.body) {
      assert.equal(post.link, `https://tierisch-verliebt.${market}/partnersuche/${post.slug}/`);
      assert.ok(post.title.rendered.length > 10, post.slug);
      assert.match(post.excerpt.rendered, /^<p>.+<\/p>\n$/);
      assert.doesNotMatch(post.excerpt.rendered, /Lesen Sie w|Hier finden Sie weitere/);
      assert.match(post.date, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
      assert.ok(post.featured_media > 0);
      const [media] = post._embedded["wp:featuredmedia"];
      assert.equal(media.id, post.featured_media);
      assert.equal(media.source_url, `https://tierisch-verliebt.${market}/magazin/wp-json/datingnischen/v1/bild/cities/${market}/${post.slug}~jpg`);
      assert.doesNotMatch(media.source_url, /vercel\.app|\.(?:jpe?g|png|webp)$/);
      assert.ok(media.alt_text.trim(), "Alt-Text nie leer");
      // Echte Bildmaße der Datei in public/cities/<land>/
      const size = imageSize(readFileSync(new URL(`public/cities/${market}/${post.slug}.jpg`, root)));
      assert.deepEqual([media.media_details.width, media.media_details.height], size, post.slug);
      const large = media.media_details.sizes.medium_large;
      assert.deepEqual([large.width, large.height, large.source_url], [...size, media.source_url]);
      // Bildroute nimmt den Pfad an
      const route = ["datingnischen", "v1", "bild", "cities", market, `${post.slug}~jpg`];
      assert.equal(teaserImagePath(route), `/cities/${market}/${post.slug}.jpg`);
    }
  });
}

test("Konfiguration: genau drei Städte je Land", () => {
  assert.deepEqual(Object.fromEntries(Object.entries(TEASER_CITIES).map(([market, rows]) => [market, rows.map((row) => row.slug)])), EXPECTED);
});

test("Route: tv_market wählt den Länderknoten und wird aus den Parametern entfernt; sonst .de-Magazin", () => {
  const params = new URLSearchParams(`per_page=3&${MARKET_TEASER_PARAM}=ch`);
  const source = marketTeaserSourceFor(params);
  assert.equal(source.posts[0].slug, "zuerich");
  assert.equal(params.has(MARKET_TEASER_PARAM), false);
  assert.equal(marketTeaserSourceFor(new URLSearchParams("per_page=3")), undefined);
  assert.equal(marketTeaserSourceFor(new URLSearchParams(`${MARKET_TEASER_PARAM}=nl`)), undefined);
  // .de unverändert: Magazinbeiträge mit Links ins .de-Magazin
  const de = handleWpRest("/wp/v2/posts", new URLSearchParams("per_page=3"), marketTeaserSourceFor(new URLSearchParams("per_page=3")));
  for (const post of de.body) assert.match(post.link, /^https:\/\/tierisch-verliebt\.de\/magazin\//);
});

const rewrite = (url, headers = {}) => {
  const response = proxy(new NextRequest(url, { headers }));
  assert.equal(response.status, 200, url);
  assert.equal(response.headers.get("location"), null, url);
  return new URL(response.headers.get("x-middleware-rewrite") || "about:blank");
};

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
