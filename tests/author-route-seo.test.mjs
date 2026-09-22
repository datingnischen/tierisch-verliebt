import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("christian author route canonicalizes to the ranking page and stays noindex,follow", async () => {
  const authorRoute = await source("../app/magazin/author/[slug]/page.tsx");
  assert.ok(authorRoute.includes('const CHRISTIAN_CANONICAL_PATH = "/magazin/christian"'));
  assert.ok(authorRoute.includes('const canonicalPath = slug === "christian-m-haas" ? CHRISTIAN_CANONICAL_PATH : `/magazin/author/${slug}`;'));
  assert.ok(authorRoute.includes("const shouldNoindex = isNoindexAuthorArchive(slug);"));
  assert.ok(authorRoute.includes('canonical: `${SITE_URL}${canonicalPath}`'));
  assert.match(authorRoute, /robots:\s*shouldNoindex[\s\S]*index:\s*false[\s\S]*follow:\s*true/);
  assert.ok(authorRoute.includes('url: `${SITE_URL}${canonicalPath}`'));
});

test("indexable author routes emit bounded structured data while the christian alias stays graph-free", async () => {
  const authorRoute = await source("../app/magazin/author/[slug]/page.tsx");
  assert.match(authorRoute, /const structuredData: StructuredData\[\] = shouldNoindex\s*\? \[\]/);
  assert.match(authorRoute, /"@type": "BreadcrumbList"/);
  assert.match(authorRoute, /"@type": isEditorialTeamPage \? "AboutPage" : "ProfilePage"/);
  assert.match(authorRoute, /mainEntity:\s*isEditorialTeamPage/);
  assert.match(authorRoute, /"@type": "Thing"/);
  assert.match(authorRoute, /"@type": "Person"/);
  assert.match(authorRoute, /"@id": `\$\{canonicalUrl\}#person`/);
  assert.match(authorRoute, /type="application\/ld\+json"/);
  assert.match(authorRoute, /serializeJsonLd\(payload\)/);
});

test("author archives without posts redirect to the author profile and stay out of the sitemap", async () => {
  const authorRoute = await source("../app/magazin/author/[slug]/page.tsx");
  assert.match(authorRoute, /import \{ notFound, permanentRedirect \} from "next\/navigation";/);
  assert.match(authorRoute, /if \(!posts\.length\) permanentRedirect\(CHRISTIAN_CANONICAL_PATH\);/);

  const profiles = await source("../lib/author-profiles.ts");
  assert.match(profiles, /export function isNoindexAuthorArchive\(slug: string\)/);
  assert.match(profiles, /NOINDEX_AUTHOR_SLUGS = new Set\(\["christian-m-haas"\]\)/);

  const sitemap = await source("../app/sitemap.ts");
  assert.match(sitemap, /\.filter\(\(slug\) => !isNoindexAuthorArchive\(slug\)\)/);
});
