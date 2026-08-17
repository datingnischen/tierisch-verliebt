import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("magazine overview uses roomier curated overview modules", async () => {
  const page = await source("../app/magazin/page.tsx");
  assert.match(page, /const latestPosts = posts\.slice\(0, 3\);/);
  assert.match(page, /const importantPages = pages\.slice\(0, 6\);/);
  assert.match(page, /className="shell shell-narrow magazine-overview-page"/);
  assert.match(page, /hero-brand-magazine/);
  assert.match(page, /editorial-feature-card editorial-feature-card-magazine/);
  assert.match(page, /className="grid-two magazine-overview-grid"/);
  assert.match(page, /article-card-rich article-card-rich-magazine/);
  assert.match(page, /className="chip chip-magazine-topic"/);
  assert.match(page, /Schnelle Wege zu Hund, Katze, Vögeln, Apps und weiteren Themen/);
  assert.match(page, /className="article-card article-card-compact article-card-page-link"/);
  assert.match(page, /Hilfreiche Seiten auf einen Blick/);
  assert.match(page, /wichtige Themen, Hintergründe und hilfreiche Magazin-Bereiche/);
});

test("global styles define the magazine overview and footer polish hooks", async () => {
  const css = await source("../app/globals.css");
  assert.match(css, /\.magazine-overview-page \{/);
  assert.match(css, /\.magazine-category-header/);
  assert.match(css, /\.hero-brand-magazine[\s\S]*padding: 44px 36px 34px;/);
  assert.match(css, /\.magazine-overview-grid[\s\S]*gap: 28px;/);
  assert.match(css, /\.article-card-rich-magazine[\s\S]*grid-template-columns: minmax\(208px, 232px\) minmax\(0, 1fr\);/);
  assert.match(css, /\.chip-row-magazine[\s\S]*gap: 10px 12px;/);
  assert.match(css, /\.chip-row-magazine[\s\S]*align-items: flex-start;/);
  assert.match(css, /\.chip-magazine-topic[\s\S]*padding: 9px 14px;/);
  assert.match(css, /\.article-card-page-link/);
  assert.match(css, /align-items: start;/);
  assert.match(css, /\.footer-link-grid[\s\S]*padding: 30px;/);
  assert.match(css, /\.footer-column h2[\s\S]*border-bottom:/);
  assert.match(css, /\.footer-brand-badge/);
  assert.match(css, /\.sub-footer-market-link/);
  assert.match(css, /\.sub-footer[\s\S]*border-top:/);
});
