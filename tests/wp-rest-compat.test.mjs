import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { imageSize } from "../scripts/magazin-bildmasse.mjs";
import { berlinToUtc, handleWpRest, wpRestPreflight, wpRestResponse } from "../lib/wp-rest-compat.ts";
import { getMagazinePages, getMagazinePosts } from "../lib/magazine.ts";
import { proxy } from "../proxy.ts";

const root = new URL("../", import.meta.url);
const source = (path) => readFileSync(new URL(path, root), "utf8");
const get = (route, query = "") => handleWpRest(route, new URLSearchParams(query));
const POSTS = (await getMagazinePosts()).length;
assert.equal(POSTS, 84);
assert.equal((await getMagazinePages()).length, 178);

test("posts: Teaser-Abruf wie bei ICONY liefert drei Beiträge im WordPress-Format mit Gesamtzahl-Headern", () => {
  const result = get("/wp/v2/posts", "per_page=3&_embed=1&orderby=date&order=desc");
  assert.equal(result.status, 200);
  assert.equal(result.body.length, 3);
  assert.equal(result.headers["X-WP-Total"], String(POSTS));
  assert.equal(result.headers["X-WP-TotalPages"], String(Math.ceil(POSTS / 3)));
  assert.match(result.headers.Link, /rel="next"/);

  const [first, second] = result.body;
  assert.ok(first.date >= second.date, "neueste zuerst");
  for (const post of result.body) {
    for (const key of ["id", "date", "date_gmt", "modified", "modified_gmt", "slug", "status", "type", "link", "title", "excerpt", "content", "featured_media", "categories", "author"]) {
      assert.ok(key in post, `${post.slug}: ${key}`);
    }
    assert.equal(post.status, "publish");
    assert.equal(post.type, "post");
    assert.equal(typeof post.title.rendered, "string");
    assert.equal(typeof post.excerpt.rendered, "string");
    assert.equal(typeof post.content.rendered, "string");
    assert.equal(typeof post.author, "number", "author nur als ID");
    assert.ok(Array.isArray(post.categories) && post.categories.length > 0);
    assert.equal(post.link, `https://tierisch-verliebt.de/magazin/${post.slug}/`, "kanonische Live-URL der Domain");

    const media = post._embedded["wp:featuredmedia"][0];
    assert.match(media.source_url, /^https:\/\/tierisch-verliebt\.vercel\.app\/app-assets\/magazin\/wp-content\/uploads\//, "Asset-Host");
    assert.ok(media.media_details.width > 0 && media.media_details.height > 0);
    assert.ok(media.alt_text.trim(), "Alt-Text nie leer");
    assert.ok(post._embedded["wp:term"][0].length > 0);
    assert.equal(post._embedded.author, undefined, "keine eingebetteten Autoren");
  }
});

test("date ist veröffentlicht, modified ist aktualisiert, *_gmt ist UTC aus Europe/Berlin", () => {
  const post = get("/wp/v2/posts", "slug=community-dating").body[0];
  assert.equal(post.date, "2026-05-28T07:05:37");
  assert.equal(post.modified, "2026-05-28T12:11:16");
  assert.equal(post.date_gmt, "2026-05-28T05:05:37", "Sommerzeit");
  assert.equal(berlinToUtc("2026-01-15T12:00:00"), "2026-01-15T11:00:00", "Winterzeit");
});

test("Auszüge sind vollständige Sätze, Beitragsbilder haben Alt-Text und Maße, alle Bilder sind in den Maßen erfasst", async () => {
  const posts = get("/wp/v2/posts", "per_page=100&_embed").body;
  const sizes = JSON.parse(source("data/magazin/bildmasse.json"));
  for (const post of posts) {
    const text = post.excerpt.rendered.replace(/<[^>]+>/g, "").trim();
    assert.match(text, /[.!?…"“”)]$/, `${post.slug}: Auszug endet mitten im Satz`);
    const media = post._embedded?.["wp:featuredmedia"]?.[0];
    if (!media) continue;
    assert.ok(media.alt_text.trim(), `${post.slug}: leerer Alt-Text`);
    assert.ok(media.media_details.width > 0, `${post.slug}: Bildmaße fehlen (node scripts/magazin-bildmasse.mjs)`);
    const upload = media.source_url.match(/\/magazin\/wp-content\/uploads\/.+$/)[0];
    const real = imageSize(readFileSync(new URL(`public${upload}`, root)));
    assert.deepEqual(sizes[upload], real, upload);
  }
});

test("posts: _fields, slug, categories, order und Paginierung verhalten sich wie WordPress", () => {
  const slim = get("/wp/v2/posts", "per_page=2&_fields=id,link,title.rendered,excerpt");
  assert.deepEqual(Object.keys(slim.body[0]).sort(), ["excerpt", "id", "link", "title"]);
  assert.deepEqual(Object.keys(slim.body[0].title), ["rendered"]);

  const embedded = get("/wp/v2/posts", "per_page=1&_embed&_fields=id,_embedded");
  assert.deepEqual(Object.keys(embedded.body[0]).sort(), ["_embedded", "id"]);

  const bySlug = get("/wp/v2/posts", "slug=voegel-wohnung-halten");
  assert.equal(bySlug.body.length, 1);
  assert.equal(bySlug.body[0].slug, "voegel-wohnung-halten");
  assert.equal(bySlug.headers["X-WP-Total"], "1");

  const category = get("/wp/v2/categories", "slug=ratgeber-voegel").body[0];
  const inCategory = get("/wp/v2/posts", `categories=${category.id}&per_page=100`);
  assert.equal(inCategory.body.length, category.count);
  assert.ok(inCategory.body.every((post) => post.categories.includes(category.id)));

  const ascending = get("/wp/v2/posts", "orderby=date&order=asc&per_page=2").body;
  assert.ok(ascending[0].date <= ascending[1].date);

  const page2 = get("/wp/v2/posts", "per_page=10&page=2");
  assert.equal(page2.body.length, 10);
  assert.match(page2.headers.Link, /rel="prev"/);
  assert.equal(get("/wp/v2/posts", "per_page=10&page=99").status, 400);
  assert.equal(get("/wp/v2/posts", "per_page=500").body.length, Math.min(100, POSTS), "per_page wird auf 100 begrenzt");

  const ids = get("/wp/v2/posts", "per_page=100&_fields=id").body.map((post) => post.id);
  assert.deepEqual(get("/wp/v2/posts", `include=${ids[2]},${ids[0]}&orderby=include&_fields=id`).body.map((post) => post.id), [ids[2], ids[0]]);
  assert.equal(get("/wp/v2/posts", "search=zzzqqqnichtvorhanden").body.length, 0);
  assert.ok(get("/wp/v2/posts", "search=Vogel").body.length > 0);
  assert.equal(get("/wp/v2/posts", "after=2999-01-01T00:00:00").body.length, 0);
  assert.equal(get("/wp/v2/posts", "before=2000-01-01T00:00:00").body.length, 0);
  assert.equal(get("/wp/v2/posts", "after=2000-01-01T00:00:00&per_page=100").body.length, Math.min(100, POSTS));
});

test("nur Beiträge: Seiten und fremde Inhalte sind nicht abrufbar, Beitrags-ID, Kategorien und Beitragsbild schon", async () => {
  const pages = await getMagazinePages();
  const posts = get("/wp/v2/posts", "per_page=100").body;
  for (const page of pages) {
    assert.ok(!posts.some((post) => post.slug === page.slug), `Seite ${page.slug} im Beitrags-Feed`);
    assert.equal(get("/wp/v2/posts", `slug=${page.slug}`).body.length, 0, page.slug);
  }
  for (const route of ["/wp/v2/pages", "/wp/v2/pages/1", "/wp/v2/stadt", "/wp/v2/types", "/wp/v2/search", "/wp/v2/media"]) {
    assert.equal(get(route).status, 404, route);
  }
  const post = get("/wp/v2/posts", "slug=voegel-wohnung-halten").body[0];
  assert.equal(get(`/wp/v2/posts/${post.id}`).body.slug, "voegel-wohnung-halten");
  assert.equal(get("/wp/v2/posts/999999").status, 404);
  assert.equal(get(`/wp/v2/media/${post.featured_media}`).body.id, post.featured_media);
  assert.ok(get("/wp/v2/media/999999").status === 404);
  assert.equal(get("/wp/v2/categories", "per_page=100").body.length, 6);
  assert.equal(get("/wp/v2/tags").body.length, 0);
  assert.equal(get("/wp/v2/posts/trailing/slash/too/deep").status, 404);
});

test("KEIN users-Endpunkt: Autoren gibt es nur als ID, kein Name oder Avatar in irgendeiner Antwort", () => {
  for (const route of ["/wp/v2/users", "/wp/v2/users/3", "/wp/v2/users/me"]) {
    const result = get(route);
    assert.equal(result.status, 404, route);
    assert.equal(result.body.code, "rest_no_route", route);
  }
  assert.equal(get("/wp/v2/users", "slug=christian-m-haas").status, 404);
  assert.equal(get("/wp/v2/users", "search=Redaktion").status, 404);

  const all = JSON.stringify(get("/wp/v2/posts", "per_page=100&_embed&_fields=id,author,_embedded,_links").body);
  assert.doesNotMatch(all, /gravatar|avatar_urls|\/users\//);
  assert.doesNotMatch(all, /Christian M\. Haas|Redaktion|Tierliebe/);

  assert.doesNotMatch(JSON.stringify(get("/").body), /users/);
  assert.doesNotMatch(JSON.stringify(get("/wp/v2").body), /users/);
});

test("Antwort-Header: CORS offen, Cache-Header, JSON, noindex; OPTIONS und HEAD funktionieren", async () => {
  const response = wpRestResponse(get("/wp/v2/posts", "per_page=3"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.match(response.headers.get("access-control-expose-headers"), /X-WP-Total, X-WP-TotalPages/);
  assert.match(response.headers.get("cache-control"), /s-maxage=3600/);
  assert.match(response.headers.get("content-type"), /^application\/json/);
  assert.equal(response.headers.get("x-wp-total"), String(POSTS));
  assert.equal(response.headers.get("x-robots-tag"), "noindex");
  assert.equal((await response.json()).length, 3);

  const notFound = wpRestResponse(get("/wp/v2/users"));
  assert.equal(notFound.status, 404);
  assert.equal(notFound.headers.get("access-control-allow-origin"), "*");

  const head = wpRestResponse(get("/wp/v2/posts"), "HEAD");
  assert.equal(await head.text(), "");
  assert.equal(head.headers.get("x-wp-total"), String(POSTS));

  const preflight = wpRestPreflight();
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), "*");
});

test("proxy: wp-json und ?rest_route= antworten ohne Umleitung, auf Live-Domain und Vorschau-Host, mit und ohne /de und Schrägstrich", () => {
  const run = (url) => proxy(new NextRequest(url));
  for (const base of ["https://tierisch-verliebt.vercel.app", "https://tierisch-verliebt.de"]) {
    for (const path of ["/magazin/wp-json/wp/v2/posts", "/magazin/wp-json/wp/v2/posts/", "/de/magazin/wp-json/wp/v2/posts", "/magazin/index.php?rest_route=/wp/v2/posts", "/de/magazin/index.php?rest_route=/wp/v2/posts"]) {
      const response = run(`${base}${path}`);
      assert.equal(response.status, 200, `${base}${path}`);
      assert.equal(response.headers.get("location"), null, `${base}${path}`);
      assert.match(response.headers.get("x-middleware-rewrite") || "", /\/magazin\/(?:wp-json\/wp\/v2\/posts|index\.php\?rest_route=)/, `${base}${path}`);
      assert.doesNotMatch(response.headers.get("x-middleware-rewrite") || "", /\/de\/magazin/, `${base}${path}`);
    }
    for (const path of ["/magazin/?rest_route=/wp/v2/posts", "/magazin?rest_route=/wp/v2/posts", "/de/magazin/?rest_route=/wp/v2/posts"]) {
      const response = run(`${base}${path}`);
      assert.equal(response.status, 200, `${base}${path}`);
      assert.match(response.headers.get("x-middleware-rewrite") || "", /\/magazin\/index\.php\?rest_route=/, `${base}${path}`);
    }
  }
  // Das normale Magazin bleibt unberührt, andere Länderdomains haben keinen Endpunkt.
  assert.equal(run("https://tierisch-verliebt.de/magazin/voegel-tierarzt").headers.get("location"), "https://tierisch-verliebt.de/magazin/voegel-tierarzt/");
  assert.doesNotMatch(run("https://tierisch-verliebt.de/magazin/").headers.get("x-middleware-rewrite") || "", /index\.php/);
  assert.doesNotMatch(run("https://tierisch-verliebt.at/magazin/?rest_route=/wp/v2/posts").headers.get("x-middleware-rewrite") || "", /index\.php/);
});

test("Routen: wp-json, index.php und Tracing sind verdrahtet; kein users-Endpunkt im Quelltext", () => {
  const wpJson = source("app/magazin/wp-json/[[...route]]/route.ts");
  assert.match(wpJson, /handleWpRest\(`\/\$\{route\.join\("\/"\)\}`/);
  assert.match(wpJson, /export function OPTIONS/);
  const index = source("app/magazin/index.php/route.ts");
  assert.match(index, /handleRestRouteQuery/);
  assert.match(index, /export function OPTIONS/);
  const compat = source("lib/wp-rest-compat.ts");
  assert.match(compat, /params\.get\("rest_route"\)/);
  assert.match(compat, /params\.delete\("rest_route"\)/);
  assert.doesNotMatch(compat, /"\/wp\/v2\/users"|resource === "users"|avatar_urls/);
  assert.doesNotMatch(source("next.config.ts"), /wp-json/, "keine Umleitung mehr auf den Endpunkt");
  assert.ok(existsSync(new URL("data/magazin/bildmasse.json", root)));
});
