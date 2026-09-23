import assert from "node:assert/strict";
import test from "node:test";
import { extractLeadImage } from "../lib/magazine-lead-image.ts";

const img = `<img decoding="async" class="alignnone wp-image-3390 size-full" src="https://tierisch-verliebt.de/magazin/wp-content/uploads/2025/10/kitty-nip.jpg" alt="Kitty-Nip" width="800" height="445" />`;

test("leading image paragraph becomes the lead image and leaves the body", () => {
  const result = extractLeadImage(`<p>${img}</p>\n<p>Text</p>`);
  assert.ok(result);
  assert.equal(result.image.src, "https://tierisch-verliebt.de/magazin/wp-content/uploads/2025/10/kitty-nip.jpg");
  assert.equal(result.image.alt, "Kitty-Nip");
  assert.equal(result.content.trim(), "<p>Text</p>");
});

test("linked image in a figure with caption is recognised", () => {
  const result = extractLeadImage(`<figure class="wp-block-image"><a href="x.jpg">${img}</a><figcaption>Bild</figcaption></figure><h2>Start</h2>`);
  assert.ok(result);
  assert.equal(result.content, "<h2>Start</h2>");
});

test("images further down or next to text stay in the body", () => {
  assert.equal(extractLeadImage(`<p>Intro</p><p>${img}</p>`), null);
  assert.equal(extractLeadImage(`<p>${img} Text daneben</p>`), null);
});
