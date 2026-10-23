import assert from "node:assert/strict";
import test from "node:test";
import { resolveMarketRequest, previewPathForUrl } from "../lib/markets.ts";
import { NextRequest } from "next/server.js";
import { proxy } from "../proxy.ts";
import { getChArticles, getChArticle, chMagazineGraph } from "../lib/ch-magazine.ts";
import { loadMagazineStore } from "../lib/magazine-store.ts";

test("Schweizer Magazin bekommt eigene Routen auf Live-Host und Vorschau", () => {
  for (const [path, host] of [["/ch/magazin/", "localhost"], ["/magazin/", "tierisch-verliebt.ch"]]) {
    assert.deepEqual(resolveMarketRequest(path, host), { action: "ch-magazine", market: "ch", pathname: "/market-ch-magazin" });
  }
  assert.deepEqual(resolveMarketRequest("/ch/magazin/erstes-date-mit-hund/", "localhost"), {
    action: "ch-magazine", market: "ch", pathname: "/market-ch-magazin/erstes-date-mit-hund",
  });
  assert.equal(previewPathForUrl("https://tierisch-verliebt.ch/magazin/erstes-date-mit-hund/#checkliste"), "/ch/magazin/erstes-date-mit-hund/#checkliste");
});

test("Schweiz übernimmt keine deutschen Artikel und interne Magazinroute bleibt geschützt", () => {
  assert.deepEqual(resolveMarketRequest("/ch/magazin/labrador-retriever/"), { action: "not-found" });
  assert.deepEqual(resolveMarketRequest("/market-ch-magazin/erstes-date-mit-hund/"), { action: "not-found" });
  assert.equal(previewPathForUrl("https://tierisch-verliebt.ch/magazin/labrador-retriever/"), null);
  assert.deepEqual(resolveMarketRequest("/de/magazin/labrador-retriever/"), { action: "rewrite", market: "de", pathname: "/magazin/labrador-retriever/" });
  assert.equal(resolveMarketRequest("/at/magazin/").action, "placeholder");
});

test("Proxy schreibt CH-Magazin mit Landesheader um, interne Route nicht öffentlich", () => {
  const response = proxy(new NextRequest("https://tierisch-verliebt.vercel.app/ch/magazin/"));
  assert.equal(new URL(response.headers.get("x-middleware-rewrite")).pathname, "/market-ch-magazin/");
  assert.equal(response.headers.get("x-middleware-request-x-tv-market"), "ch");
  assert.equal(proxy(new NextRequest("https://tierisch-verliebt.vercel.app/market-ch-magazin/")).status, 404);
});

test("CH-Dateiquelle und strukturierte Daten bleiben vollständig in der Schweiz", () => {
  const articles = getChArticles();
  assert.equal(articles.length, 3);
  assert.equal(getChArticle("labrador-retriever"), null);
  const deSlugs = new Set(loadMagazineStore().posts.map(article => article.slug));
  for (const article of articles) {
    assert.equal(deSlugs.has(article.slug), false);
    const graph = chMagazineGraph(article)["@graph"];
    const schema = graph.find(item => item["@type"] === "Article");
    assert.equal(schema.url, `https://tierisch-verliebt.ch/magazin/${article.slug}/`);
    assert.equal(schema.inLanguage, "de-CH");
    assert.equal(schema.dateModified, "2026-10-23");
    assert.equal(graph.find(item => item["@type"] === "FAQPage").mainEntity.length, 3);
    assert.equal(article.sections.some(section => section.id === "checkliste"), true);
  }
});
