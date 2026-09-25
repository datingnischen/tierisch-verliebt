import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("magazine overview uses the Gassi-Guide look with curated entry points", async () => {
  const page = await source("../app/magazin/page.tsx");
  assert.match(page, /const latestPosts = posts\.slice\(1, 7\);/);
  assert.doesNotMatch(page, /pages\.slice\(0, 6\)/);
  assert.match(page, /const MAGAZINE_ENTRY_POINTS: EntryPoint\[\] = \[/);
  for (const href of ["/magazin/hunderassen", "/magazin/katzenrassen", "/magazin/tierwelten", "/magazin/kleintiere"]) {
    assert.ok(page.includes(`href: "${href}"`), href);
  }
  assert.match(page, /className=\{`tvc tvm \$\{display\.variable\}`\}/);
  assert.match(page, /className="tvc-hero tvh-hero tvm-hero"/);
  assert.match(page, /className="tvm-feature"/);
  assert.match(page, /className="tvc-wrap tvm-topics"/);
  assert.match(page, /className="tvm-bento"/);
  assert.match(page, /className="tvh-card tvm-post"/);
  assert.match(page, /href="\/magazin\/inhalt"/);
  assert.match(page, /Wichtige Einstiege/);
  assert.match(page, /https:\/\/tierisch-verliebt\.de\/\?AID=magazin/);
});

test("global styles define the magazine overview and footer polish hooks", async () => {
  const css = await source("../app/globals.css");
  assert.match(css, /\.magazine-overview-page \{/);
  assert.match(css, /\.magazine-category-header/);
  assert.match(css, /\.hero-brand-magazine[\s\S]*padding: 44px 36px 34px;/);
  assert.match(css, /\.magazine-overview-grid[\s\S]*gap: 28px;/);
  assert.match(css, /\.article-card-rich-magazine[\s\S]*grid-template-columns: minmax\(208px, 232px\) minmax\(0, 1fr\);/);
  assert.match(css, /\.magazine-topic-grid[\s\S]*grid-template-columns: repeat\(auto-fill, minmax\(260px, 1fr\)\);/);
  assert.match(css, /\.magazine-topic-card-index/);
  assert.match(css, /\.entry-point-grid \{/);
  assert.match(css, /\.entry-point-card-image::after/);
  assert.match(css, /align-items: start;/);
  assert.match(css, /\.tv-footer-cta \{/);
  assert.match(css, /\.tv-footer-nav \{[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
  assert.match(css, /\.tv-footer-markets a\[aria-current\]/);
  assert.match(css, /\.tv-footer-bottom \{[\s\S]*border-top:/);
});
