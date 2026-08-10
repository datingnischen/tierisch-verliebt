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

test("global styles define the richer breed-page presentation", async () => {
  const css = await source("../app/globals.css");
  assert.match(css, /\.breed-rich-content/);
  assert.match(css, /\.breed-facts-card/);
  assert.match(css, /\.breed-facts-list li/);
  assert.match(css, /\.breed-facts-paw/);
  assert.match(css, /\.article-hero-media-breed/);
});
