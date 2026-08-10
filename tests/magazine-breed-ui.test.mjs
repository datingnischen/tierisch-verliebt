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

test("magazine detail pages render a conversion rail with online iframe and CTAs", async () => {
  const page = await source("../app/magazin/[slug]/page.tsx");
  assert.match(page, /function MagazineConversionRail/);
  assert.match(page, /ONLINE_IFRAME_SRC/);
  assert.match(page, /MAGAZINE_CTA_IMAGE = staticAsset/);
  assert.match(page, /Gerade online auf tierisch-verliebt\.de/);
  assert.match(page, /magazine-conversion-card-banner/);
  assert.match(page, /magazine-conversion-points/);
  assert.match(page, /magazine-detail-layout/);
  assert.match(page, /magazine-detail-side/);
  assert.match(page, /magazine-mobile-conversion/);
});

test("global styles define the richer breed-page presentation and conversion rail", async () => {
  const css = await source("../app/globals.css");
  assert.match(css, /\.breed-rich-content/);
  assert.match(css, /\.breed-facts-card/);
  assert.match(css, /\.breed-highlight-grid/);
  assert.match(css, /\.breed-jump-nav/);
  assert.match(css, /\.breed-faq-card/);
  assert.match(css, /\.breed-inline-media/);
  assert.match(css, /\.magazine-detail-layout/);
  assert.match(css, /\.magazine-conversion-rail/);
  assert.match(css, /\.magazine-conversion-card-banner/);
  assert.match(css, /\.magazine-conversion-hero/);
  assert.match(css, /\.magazine-conversion-points/);
  assert.match(css, /\.magazine-online-frame/);
});
