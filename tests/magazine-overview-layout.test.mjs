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
  assert.match(page, /className="article-card article-card-compact article-card-page-link"/);
  assert.match(page, /Hilfreiche Seiten auf einen Blick/);
  assert.match(page, /wichtige Themen, Hintergründe und hilfreiche Magazin-Bereiche/);
});

test("global styles define the magazine overview and footer polish hooks", async () => {
  const css = await source("../app/globals.css");
  assert.match(css, /\.hero-brand-magazine/);
  assert.match(css, /\.magazine-overview-grid/);
  assert.match(css, /\.article-card-rich-magazine/);
  assert.match(css, /\.article-card-page-link/);
  assert.match(css, /align-items: start;/);
  assert.match(css, /\.footer-link-grid[\s\S]*border-radius: 30px;/);
  assert.match(css, /\.footer-column h2[\s\S]*border-bottom:/);
  assert.match(css, /\.footer-brand-badge/);
  assert.match(css, /\.sub-footer-market-link/);
  assert.match(css, /\.sub-footer[\s\S]*border-top:/);
});
