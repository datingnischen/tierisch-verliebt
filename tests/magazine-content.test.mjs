import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { loadMagazineStore } from "../lib/magazine-store.ts";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const CONTENT = join(ROOT, "content", "magazin");
const UPLOADS = "/magazin/wp-content/uploads/";

const files = readdirSync(CONTENT).filter((file) => file.endsWith(".md") && !file.startsWith("_"));
const docs = files.map((file) => ({ file, ...matter(readFileSync(join(CONTENT, file), "utf8")) }));
const slugs = JSON.parse(readFileSync(join(ROOT, "data", "magazin", "slugs.json"), "utf8"));

function sourceFiles(dir) {
  return readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

test("every WordPress slug (84 posts, 178 pages) exists as a content file with the same type", () => {
  assert.equal(slugs.posts.length, 84);
  assert.equal(slugs.pages.length, 178);
  const byType = { post: new Set(), page: new Set() };
  for (const doc of docs) byType[doc.data.type].add(doc.data.slug);
  assert.deepEqual([...byType.post].sort(), slugs.posts);
  assert.deepEqual([...byType.page].sort(), slugs.pages);
  assert.equal(docs.length, new Set(docs.map((doc) => doc.data.slug)).size);
});

test("the store serves the same entries and finds the percent-encoded slug decoded", () => {
  const store = loadMagazineStore();
  assert.equal(store.posts.length, 84);
  assert.equal(store.pages.length, 178);
  assert.ok(store.bySlug.get("sichere-spielzeug%d0%b5-fuer-den-hund"));
  assert.equal(store.bySlug.get("sichere-spielzeugе-fuer-den-hund")?.slug, "sichere-spielzeug%d0%b5-fuer-den-hund");
  const counted = store.categories.reduce((sum, category) => sum + category.count, 0);
  assert.equal(counted, 87);
});

test("posts are sorted newest first and carry a modified date for 'Aktualisiert am'", () => {
  const { posts } = loadMagazineStore();
  for (let index = 1; index < posts.length; index += 1) assert.ok(posts[index - 1].date >= posts[index].date);
  assert.ok(posts.every((post) => post.modified));
});

test("all authors are Christian M. Haas, no placeholder authors remain", () => {
  for (const doc of docs) assert.equal(doc.data.author, "christian-m-haas", doc.file);
  const authors = JSON.parse(readFileSync(join(ROOT, "data", "magazin", "autoren.json"), "utf8"));
  assert.deepEqual(authors.map((author) => author.name), ["Christian M. Haas"]);
});

test("content has no WordPress leftovers and stores uploads as relative paths", () => {
  for (const doc of docs) {
    assert.ok(!/tierisch-verliebt\.de\/magazin\/wp-content/.test(doc.content), `${doc.file}: absolute upload URL`);
    assert.ok(!/ngg_shortcode_\d+_placeholder/.test(doc.content), `${doc.file}: NextGEN placeholder`);
    assert.ok(!doc.content.includes("<!--more-->"), `${doc.file}: more tag`);
    assert.ok(!/wp-json|wp-admin|wp-login/.test(doc.content), `${doc.file}: WordPress endpoint`);
  }
});

test("every referenced upload exists under public/ and file names are plain ASCII", () => {
  const missing = [];
  for (const doc of docs) {
    const refs = [...doc.content.matchAll(/\/magazin\/wp-content\/uploads\/([^"'\s<>,)?]+)/g)].map((match) => match[1]);
    if (doc.data.image) refs.push(doc.data.image.replace(UPLOADS, ""));
    for (const ref of refs) {
      assert.match(ref, /^[A-Za-z0-9._/-]+$/, `${doc.file}: ${ref}`);
      if (!existsSync(join(ROOT, "public", "magazin", "wp-content", "uploads", ref))) missing.push(`${doc.file}: ${ref}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("no <img> without alt or with empty alt in content, featured images have alt text", () => {
  const problems = [];
  for (const doc of docs) {
    for (const match of doc.content.matchAll(/<img\b[^>]*>/g)) {
      const alt = match[0].match(/\salt=(["'])(.*?)\1/s);
      if (!alt || !alt[2].trim()) problems.push(`${doc.file}: ${match[0].slice(0, 80)}`);
    }
    if (doc.data.image && !String(doc.data.imageAlt || "").trim()) problems.push(`${doc.file}: imageAlt fehlt`);
  }
  assert.deepEqual(problems, []);
});

test("SEO fields come from AIOSEO: titles without brand suffix, descriptions present for most entries", () => {
  assert.ok(docs.every((doc) => !String(doc.data.seoTitle || "").endsWith("| tierisch-verliebt.de")));
  const withDescription = docs.filter((doc) => doc.data.description).length;
  assert.ok(withDescription >= 240, `nur ${withDescription} Descriptions`);
  assert.equal(docs.filter((doc) => doc.data.noindex === true).length, 15);
});

test("detail page uses AIOSEO title, description and noindex; sitemap skips noindex entries", () => {
  const page = readFileSync(join(ROOT, "app", "magazin", "[slug]", "page.tsx"), "utf8");
  assert.match(page, /entry\.seoTitle \|\| entry\.title/);
  assert.match(page, /entry\.description \|\|/);
  assert.match(page, /entry\.noindex/);
  const sitemap = readFileSync(join(ROOT, "app", "sitemap.ts"), "utf8");
  assert.match(sitemap, /!post\.noindex/);
  assert.match(sitemap, /!page\.noindex/);
});

test("old WordPress URLs are redirected", () => {
  const config = readFileSync(join(ROOT, "next.config.ts"), "utf8");
  for (const source of ["/magazin/category/:slug", "/magazin/author/redaktion", "/magazin/feed", "/magazin/wp-sitemap.xml", "/magazin/wp-login.php"]) {
    assert.ok(config.includes(source), source);
  }
});

test("the app no longer talks to WordPress at runtime or build time", () => {
  const offenders = [];
  for (const file of [...sourceFiles("app"), ...sourceFiles("lib"), ...sourceFiles("components"), "proxy.ts"]) {
    // Der WP-kompatible REST-Endpunkt für ICONY (docs/wp-rest-endpunkt.md) darf die Adressen nennen.
    if (/^(?:lib[\\/]wp-rest-(?:compat|paths)\.ts|app[\\/]magazin[\\/](?:wp-json|index\.php)[\\/].*)$/.test(file)) continue;
    const source = readFileSync(join(ROOT, file), "utf8");
    if (/wp-json|WORDPRESS_|wp\/v2|fetchWp/.test(source)) offenders.push(file);
    if (/tierisch-verliebt\.de\/magazin\/author\//.test(source) && /fetch\(/.test(source)) offenders.push(`${file}: Autorenarchiv-Abruf`);
  }
  assert.deepEqual(offenders, []);
  assert.ok(!existsSync(join(ROOT, "lib", "wordpress.ts")));
  assert.ok(!existsSync(join(ROOT, ".env.local")) || !/WORDPRESS_/.test(readFileSync(join(ROOT, ".env.local"), "utf8")));
});

test("README documents the file-based content", () => {
  const readme = readFileSync(join(ROOT, "README.md"), "utf8");
  assert.match(readme, /content\/magazin/);
  assert.ok(!/wp-json/.test(readme));
});
