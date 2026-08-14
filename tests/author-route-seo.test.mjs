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
  assert.ok(authorRoute.includes('const shouldNoindex = slug === "christian-m-haas";'));
  assert.ok(authorRoute.includes('canonical: `${SITE_URL}${canonicalPath}`'));
  assert.match(authorRoute, /robots:\s*shouldNoindex[\s\S]*index:\s*false[\s\S]*follow:\s*true/);
  assert.ok(authorRoute.includes('url: `${SITE_URL}${canonicalPath}`'));
});
