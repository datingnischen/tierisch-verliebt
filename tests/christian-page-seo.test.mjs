import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("christian page uses dedicated SEO and a CMS-gated profile graph", async () => {
  const page = await source("../app/magazin/[slug]/page.tsx");
  assert.match(page, /const CHRISTIAN_PAGE_DESCRIPTION =/);
  assert.match(page, /slug === "christian"\s*\?\s*CHRISTIAN_PAGE_DESCRIPTION/);
  assert.match(page, /buildChristianBookProfileGraph\(\{/);
  assert.match(page, /christianSlug: "christian"/);
  assert.match(page, /content: entry\.content/);
  assert.match(page, /canonicalUrl: `\$\{SITE_URL\}\/magazin\/christian\/`/);
  assert.match(page, /siteUrl: SITE_URL/);
  assert.match(page, /sameAs: authorProfile\?\.sameAs/);
  assert.match(page, /dateModified: entry\.modified \|\| undefined/);
  assert.match(page, /profileGraph \? \(/);
  assert.match(page, /type="application\/ld\+json"/);
  assert.match(page, /serializeJsonLd\(profileGraph\)/);
});
