import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const source = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("FAQ-Pfad ist /faq und steht in Sitemaps", async () => {
  const faq = await import("../lib/faq.ts");
  assert.equal(faq.FAQ_PATH, "/faq");
  assert.equal(faq.faqCanonical("de"), "https://tierisch-verliebt.de/faq/");
  assert.equal(faq.faqCanonical("at"), "https://tierisch-verliebt.at/faq/");
  assert.equal(faq.faqCanonical("ch"), "https://tierisch-verliebt.ch/faq/");
  assert.match(await source("../app/sitemap.ts"), /FAQ_PATH/);
  assert.match(await source("../app/market-sitemap/[market]/route.ts"), /"\/faq"/);
});

test("AT und CH routen /faq auf die Markt-FAQ, DE auf /faq", async () => {
  const { resolveMarketRequest } = await import("../lib/markets.ts");
  assert.deepEqual(resolveMarketRequest("/faq"), { action: "rewrite", market: "de", pathname: "/faq" });
  assert.deepEqual(resolveMarketRequest("/de/faq"), { action: "rewrite", market: "de", pathname: "/faq" });
  assert.deepEqual(resolveMarketRequest("/at/faq"), { action: "market-faq", market: "at", pathname: "/market-faq/at" });
  assert.deepEqual(resolveMarketRequest("/faq", "tierisch-verliebt.ch"), { action: "market-faq", market: "ch", pathname: "/market-faq/ch" });
  assert.deepEqual(resolveMarketRequest("/market-faq/at", "tierisch-verliebt.vercel.app"), { action: "not-found" });
});

test("FAQ: Schema, Schweizer Schreibweise, keine Datumsangaben", async () => {
  const { getFaqTopics, faqPageSchema } = await import("../lib/faq.ts");
  for (const market of ["de", "at", "ch"]) {
    const topics = getFaqTopics(market);
    const schema = faqPageSchema(market, topics);
    assert.equal(schema["@type"], "FAQPage");
    assert.equal(schema.mainEntity.length, topics.reduce((n, t) => n + t.items.length, 0));
    assert.ok(schema.mainEntity.length >= 10);
    const text = JSON.stringify(topics);
    assert.doesNotMatch(text, /20\d\d/);
    assert.doesNotMatch(text, /<[a-z]/i);
    if (market === "ch") assert.doesNotMatch(text, /ß/);
  }
  assert.match(JSON.stringify(getFaqTopics("ch")), /der Schweiz/);
});

test("FAQ ist im Footer und auf Über uns verlinkt, Plattformseiten absolut", async () => {
  assert.match(await source("../components/site-shell.tsx"), /href: "\/faq"/);
  assert.match(await source("../app/ueber-uns/page.tsx"), /FAQ_PATH/);
  const browser = await source("../components/faq/faq-browser.tsx");
  assert.match(browser, /publicUrl\(market, link\.path\)/);
  assert.match(await source("../components/faq/faq-page.tsx"), /application\/ld\+json/);
});
