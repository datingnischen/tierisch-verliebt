import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("breed magazine pages detect and enhance steckbrief sections", async () => {
  const page = await source("../app/magazin/[slug]/page.tsx");
  assert.match(page, /function isBreedProfile\(html: string\)/);
  assert.match(page, /function enhanceBreedContent\(html: string\)/);
  assert.match(page, /breed-facts-list/);
  assert.match(page, /breed-facts-paw/);
  assert.match(page, /breed-rich-content/);
});

test("breed pages derive quick highlights and jump navigation from editorial content", async () => {
  const page = await source("../app/magazin/[slug]/page.tsx");
  assert.match(page, /function getBreedFacts\(html: string\)/);
  assert.match(page, /function getBreedSectionLinks\(html: string\)/);
  assert.match(page, /breed-highlight-grid/);
  assert.match(page, /breed-jump-nav/);
  assert.match(page, /breed-jump-link/);
});

test("breed FAQ content is transformed into a richer accordion block", async () => {
  const page = await source("../app/magazin/[slug]/page.tsx");
  assert.match(page, /function buildFaqMarkup\(source: string\)/);
  assert.match(page, /breed-faq-card/);
  assert.match(page, /<details class=\"breed-faq-item\"/);
  assert.match(page, /Häufige Fragen zum Barsoi/);
});

test("global styles define the richer breed-page presentation", async () => {
  const css = await source("../app/globals.css");
  assert.match(css, /\.breed-rich-content/);
  assert.match(css, /\.breed-facts-card/);
  assert.match(css, /\.breed-highlight-grid/);
  assert.match(css, /\.breed-jump-nav/);
  assert.match(css, /\.breed-faq-card/);
  assert.match(css, /\.breed-inline-media/);
});
