import assert from "node:assert/strict";
import test from "node:test";
import { buildCityGuide, nearestCities, plainText, topicFor } from "../lib/city-guide.ts";
import { getMarketCityPages } from "../lib/market-partnersuche.ts";

test("splits the imported city text into chapters without losing words", () => {
  for (const market of ["de", "at", "ch"]) {
    for (const page of getMarketCityPages(market)) {
      const guide = buildCityGuide(page);
      const rendered = plainText(guide.introHtml + guide.sections.map((s) => ` ${s.heading} ${s.html}`).join(" "));
      const words = new Set(rendered.split(" "));
      const source = plainText(page.contentHtml.replace(/<h2\b[^>]*>[\s\S]*?könnten auch interessant[\s\S]*$/i, "").replace(/Bildquelle:?\s*\S+/i, ""));
      for (const word of source.split(" ").filter(Boolean)) assert.ok(words.has(word), `${market}/${page.slug}: "${word}" fehlt`);
      assert.ok(guide.readingMinutes >= 1);
      assert.ok(!guide.related.some((link) => link.path === page.path), `${page.slug} verlinkt sich selbst`);
      const ids = guide.sections.map((s) => s.id);
      assert.equal(new Set(ids).size, ids.length, `${page.slug}: doppelte Anker`);
    }
  }
});

test("lifts the related-city list and the image credit out of the Düsseldorf text", () => {
  const page = getMarketCityPages("de").find((entry) => entry.slug === "duesseldorf");
  const guide = buildCityGuide(page);
  assert.deepEqual(guide.related.map((link) => link.path), ["/partnersuche/hamburg", "/partnersuche/berlin", "/partnersuche/koeln", "/partnersuche/muenchen", "/partnersuche/stuttgart"]);
  assert.match(guide.imageCreditUrl, /^https:\/\/pixabay\.com\//);
  assert.ok(!guide.sections.some((s) => /Bildquelle|könnten auch/.test(s.html + s.heading)));
  assert.ok(!guide.introHtml.includes(page.imageUrl), "hero image is not repeated in the text");
  assert.deepEqual(guide.animals.slice(0, 2), ["hund", "katze"]);
});

test("maps chapter headings to animal topics", () => {
  assert.equal(topicFor("Hundefreundliche Cafés"), "food");
  assert.equal(topicFor("Katzen in Düsseldorf"), "cat");
  assert.equal(topicFor("Lokale Tierdienstleister in Düsseldorf"), "vet");
  assert.equal(topicFor("Hundefrisöre in Düsseldorf"), "groom");
  assert.equal(topicFor("Rund um die Rheinwiesen"), "walk");
  assert.equal(topicFor("Hundefreundliche Hotels"), "stay");
});

test("orders neighbours by straight-line distance", () => {
  const near = nearestCities("de", "duesseldorf", getMarketCityPages("de"));
  assert.equal(near[0].slug, "duisburg");
  assert.ok(near.every((entry, index) => index === 0 || entry.km >= near[index - 1].km));
  for (const market of ["de", "at", "ch"]) {
    for (const page of getMarketCityPages(market)) assert.equal(nearestCities(market, page.slug, getMarketCityPages(market)).length, 5, `${market}/${page.slug} ohne Koordinaten`);
  }
});

test("own page links inside the ICONY text end with a slash", () => {
  const page = getMarketCityPages("de").find((entry) => entry.slug === "wuppertal");
  const guide = buildCityGuide(page);
  const html = guide.introHtml + guide.sections.map((s) => s.html).join("");
  assert.ok(!/href="https:\/\/tierisch-verliebt\.(?:de|at|ch)\/[^"]*[^/"]"/.test(html), "Link ohne Schrägstrich");
});
