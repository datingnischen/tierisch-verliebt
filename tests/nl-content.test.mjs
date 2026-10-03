import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import matter from "gray-matter";
import { NL_BREEDS } from "../lib/nl-routes.ts";
import { getNlBreed, getNlBreeds } from "../lib/nl-magazine.ts";
import { getMarketCityPages } from "../lib/market-partnersuche.ts";
import { buildCityGuide, cityGeo, nearestCities, plainText } from "../lib/city-guide.ts";

test("the NL magazine publishes five dogs and five cats with complete source structure and assets", () => {
  assert.equal(getNlBreeds("dog").length, 5);
  assert.equal(getNlBreeds("cat").length, 5);
  assert.equal(getNlBreed("../../package"), null);
  for (const breed of NL_BREEDS) {
    const source = matter(fs.readFileSync(`content/magazin/${breed.sourceSlug}.md`, "utf8"));
    const translated = matter(fs.readFileSync(`content/nl/magazin/${breed.slug}.md`, "utf8"));
    assert.equal(translated.data.locale, "nl-NL");
    assert.equal(translated.data.sourceSlug, breed.sourceSlug);
    for (const field of ["published", "updated", "author", "image"]) assert.equal(translated.data[field], source.data[field]);
    const tags = html => [...html.matchAll(/<\/?([a-z][\w-]*)\b/gi)].map(match => `${match[0].startsWith("</") ? "/" : ""}${match[1].toLowerCase()}`);
    assert.deepEqual(tags(translated.content), tags(source.content), `${breed.slug}: translated article lost source structure`);
    const media = html => [...html.matchAll(/\b(?:src|srcset|width|height|sizes)=["']([^"']*)["']/gi)].map(match => match[0]);
    assert.deepEqual(media(translated.content), media(source.content), `${breed.slug}: changed source media`);
    const entry = getNlBreed(breed.slug);
    assert.ok(entry.title && entry.description && entry.imageAlt);
    assert.ok(entry.sections.length >= 5);
    assert.doesNotMatch(entry.content, /(?:src|srcset)=["']\/magazin\/wp-content/);
    assert.equal(new Set(entry.sections.map(section => section.id)).size, entry.sections.length);
  }
});

test("15 Dutch cities have regional geography, valid search links and honest profile availability", () => {
  const cities = getMarketCityPages("nl");
  assert.equal(cities.length, 15);
  assert.equal(new Set(cities.map(city => city.slug)).size, 15);
  for (const city of cities) {
    const geo = cityGeo("nl", city.slug);
    assert.ok(geo.lat > 50 && geo.lat < 54 && geo.lon > 3 && geo.lon < 8);
    const url = new URL(city.searchUrl);
    assert.equal(url.hostname, "tierisch-verliebt.nl");
    assert.equal(url.searchParams.get("plz"), city.icony.zip);
    assert.equal(city.icony.platformId, "");
    assert.equal(city.icony.frameUrl, "");
    const guide = buildCityGuide(city);
    assert.equal(guide.imageCreditUrl, null, "municipal advice is not a credit for the brand photo");
    assert.ok(guide.sections.length >= 5);
    assert.ok(plainText(city.contentHtml).split(/\s+/).length >= 450);
    for (const topic of ["walk", "food", "cat", "vet"]) assert.ok(guide.topics.includes(topic), `${city.slug}: missing ${topic}`);
    const neighbors = nearestCities("nl", city.slug, cities);
    assert.equal(neighbors.length, 5);
    assert.ok(neighbors.every(neighbor => neighbor.km > 0 && neighbor.slug !== city.slug));
    assert.match(city.contentHtml, /href="https:\/\/[^" ]+"/);
    assert.doesNotMatch(city.contentHtml, /<(?:script|iframe|form)\b|\son\w+=/i);
  }
});
