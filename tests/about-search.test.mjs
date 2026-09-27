import assert from "node:assert/strict";
import test from "node:test";
import { access, readFile } from "node:fs/promises";
import { normalizeSearchText, searchDocuments, searchTerms } from "../lib/site-search.ts";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

async function exists(path) {
  try {
    await access(new URL(path, import.meta.url));
    return true;
  } catch {
    return false;
  }
}

const doc = (title, summary = "", body = "", path = `/magazin/${title.toLowerCase().replace(/\W+/g, "-")}`) => ({
  section: "Magazin",
  title,
  summary,
  body,
  market: "de",
  path,
});

test("Suche liegt unter /ueber-uns/suche, nicht auf /suche (ICONY)", async () => {
  assert.equal(await exists("../app/ueber-uns/suche/page.tsx"), true);
  assert.equal(await exists("../app/suche"), false);
  assert.equal(await exists("../app/suche/page.tsx"), false);
  const about = await source("../lib/about-section.ts");
  assert.match(about, /ABOUT_SEARCH_PATH = "\/ueber-uns\/suche"/);
});

test("Suchseite ist noindex, follow und hat eine Canonical ohne Query", async () => {
  const page = await source("../app/ueber-uns/suche/page.tsx");
  assert.match(page, /robots: \{ index: false, follow: true \}/);
  assert.match(page, /canonical: aboutSearchCanonical\(\)/);
  assert.doesNotMatch(page, /formatUpdatedDate|formatGermanDate/);
});

test("Suche steht nicht in der Sitemap", async () => {
  const sitemap = await source("../app/sitemap.ts");
  assert.doesNotMatch(sitemap, /ueber-uns\/suche|ABOUT_SEARCH_PATH|aboutSearchCanonical/);
});

test("Header und Über-uns-Hub verlinken die Suche", async () => {
  const shell = await source("../components/site-shell.tsx");
  assert.match(shell, /href: "\/ueber-uns\/suche"/);
  const hub = await source("../app/ueber-uns/page.tsx");
  assert.match(hub, /<AboutSearchForm \/>/);
});

test("Normalisierung: Umlaute, ß und Diakritika", () => {
  assert.equal(normalizeSearchText("Französische Bulldogge"), "franzoesische bulldogge");
  assert.equal(normalizeSearchText("Straße Zürich Café"), "strasse zuerich cafe");
  assert.deepEqual(searchTerms("  Hund  hund, Katze "), ["hund", "katze"]);
});

test("Titeltreffer stehen vor Auszug- und Volltexttreffern", () => {
  const docs = [
    doc("Katzen im Winter", "", "Auch der Hund friert."),
    doc("Alles über Katzen", "Ein Hund als Mitbewohner"),
    doc("Der Hund im Büro"),
    doc("Vögel"),
  ];
  const titles = searchDocuments(docs, "hund").map((result) => result.title);
  assert.deepEqual(titles, ["Der Hund im Büro", "Alles über Katzen", "Katzen im Winter"]);
});

test("Suche findet Umlaut-Schreibweisen und verlangt alle Begriffe", () => {
  const docs = [doc("Partnersuche in München", "", "", "/partnersuche/muenchen"), doc("Partnersuche in Köln")];
  assert.equal(searchDocuments(docs, "muenchen")[0].title, "Partnersuche in München");
  assert.equal(searchDocuments(docs, "München partnersuche").length, 1);
  assert.equal(searchDocuments(docs, "").length, 0);
});

test("Höchstens 50 Treffer", () => {
  const docs = Array.from({ length: 80 }, (_, index) => doc(`Hund ${index}`, "", "", `/magazin/hund-${index}`));
  assert.equal(searchDocuments(docs, "hund").length, 50);
});
