import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("christian page uses a dedicated SEO description and person structured data", async () => {
  const page = await source("../app/magazin/[slug]/page.tsx");
  assert.match(page, /const CHRISTIAN_PAGE_DESCRIPTION =/);
  assert.match(page, /slug === "christian"\s*\?\s*CHRISTIAN_PAGE_DESCRIPTION/);
  assert.match(page, /const isChristianPage = slug === "christian";/);
  assert.match(page, /"@type": "BreadcrumbList"/);
  assert.match(page, /"@type": "Person"/);
  assert.match(page, /christianStructuredData\.map\(\(payload\) => \(/);
  assert.match(page, /type="application\/ld\+json"/);
  assert.match(page, /JSON\.stringify\(payload\)/);
  assert.match(page, /url: `\$\{SITE_URL\}\/magazin\/christian`/);
  assert.match(page, /sameAs: \["https:\/\/datingnischen\.de\/christian", "https:\/\/www\.linkedin\.com\/in\/christian-m-haas-457323379"\]/);
});
