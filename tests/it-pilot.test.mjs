import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getMarket, marketForHostname, previewPath, previewPathForUrl, publicUrl, resolveMarketRequest } from "../lib/markets.ts";
import { IT_PILOT_INDEXABLE } from "../lib/it-routes.ts";
import { NextRequest } from "next/server.js";
import { proxy, trailingSlashRedirect } from "../proxy.ts";

const data = JSON.parse(await readFile(new URL("../data/it-partnersuche.json", import.meta.url), "utf8"));

test("Italienische Variante liegt unter tierisch-verliebt.ch/it/ und nie auf einem eigenen Host", () => {
  assert.equal(getMarket("it").locale, "it-CH");
  assert.equal(publicUrl("it"), "https://tierisch-verliebt.ch/it/");
  assert.equal(publicUrl("it", "/lugano"), "https://tierisch-verliebt.ch/it/lugano/");
  assert.equal(previewPath("it", "/lugano"), "/ch/it/lugano/");
  assert.equal(marketForHostname("tierisch-verliebt.ch"), "ch");
});

test("Vorschau, Live-Host und nginx-Präfix landen auf denselben italienischen Seiten", () => {
  for (const path of ["/", "/lugano/", "/bellinzona/", "/chiasso/"]) {
    const live = resolveMarketRequest(`/it${path}`, "tierisch-verliebt.ch");
    assert.equal(live.action, "it-pilot");
    assert.equal(live.market, "it");
    assert.deepEqual(resolveMarketRequest(`/ch/it${path}`, "tierisch-verliebt.vercel.app"), live);
    assert.deepEqual(resolveMarketRequest(`/ch/it${path}`, "tierisch-verliebt.ch"), live);
  }
  assert.equal(resolveMarketRequest("/it/lugano/", "tierisch-verliebt.ch").pathname, "/market-it/lugano");
  assert.equal(resolveMarketRequest("/ch/it/zuerich/").action, "not-found");
  assert.equal(resolveMarketRequest("/ch/it/market-it/").action, "not-found");
  assert.equal(resolveMarketRequest("/market-it/lugano/").action, "not-found");
  // Deutsche Schweizer Seiten bleiben unverändert.
  assert.equal(resolveMarketRequest("/partnersuche/bern/", "tierisch-verliebt.ch").action, "market-partnersuche-city");
});

test("Links: Italienische Seiten bleiben in der Vorschau, ICONY-Adressen live", () => {
  assert.equal(previewPathForUrl("https://tierisch-verliebt.ch/it/locarno/"), "/ch/it/locarno/");
  assert.equal(previewPathForUrl("https://tierisch-verliebt.ch/it/registration/"), null);
});

test("Schrägstrich-Umleitung bleibt auf der Vorschau und geht live auf die Landesdomain", () => {
  const preview = new NextRequest("https://tierisch-verliebt.vercel.app/ch/it/lugano");
  assert.equal(trailingSlashRedirect(preview).headers.get("location"), "https://tierisch-verliebt.vercel.app/ch/it/lugano/");
  const production = new NextRequest("https://tierisch-verliebt.vercel.app/ch/it/lugano", {
    headers: { host: "tierisch-verliebt.vercel.app", "x-forwarded-host": "tierisch-verliebt.ch" },
  });
  assert.equal(trailingSlashRedirect(production).headers.get("location"), "https://tierisch-verliebt.ch/it/lugano/");
  const response = proxy(new NextRequest("https://tierisch-verliebt.vercel.app/ch/it/lugano/"));
  assert.match(response.headers.get("x-middleware-rewrite"), /\/market-it\/lugano/);
  assert.equal(response.headers.get("x-middleware-request-x-tv-market"), "it");
});

test("Stadttexte: fünf Tessiner Städte, gültige PLZ, Descriptions 110–155 Zeichen, keine leeren Alt-Texte", () => {
  assert.deepEqual(data.pages.map((page) => page.slug), ["lugano", "bellinzona", "locarno", "mendrisio", "chiasso"]);
  for (const entry of [data, ...data.pages]) {
    assert.ok(entry.description.length >= 110 && entry.description.length <= 155, `${entry.slug ?? "hub"}: ${entry.description.length}`);
  }
  for (const page of data.pages) {
    assert.match(page.postcode, /^6\d{3}$/);
    assert.match(page.contentHtml, /<h2>/);
    assert.doesNotMatch(page.contentHtml, /alt=""/);
    assert.doesNotMatch(page.contentHtml, /tierisch-verliebt\.(de|at)/, "keine Links auf deutsche oder österreichische Seiten");
    assert.ok(`Amanti degli animali a ${page.cityName} | tierisch-verliebt.ch`.length <= 60, page.slug);
  }
});

test("Pilot bleibt noindex, bis ICONY die italienische Registrierung ausliefert", async () => {
  assert.equal(IT_PILOT_INDEXABLE, false);
  const page = await readFile(new URL("../app/market-it/[[...path]]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /robots: \{ index: IT_PILOT_INDEXABLE, follow: true \}/);
});

test("Stadtführer mit belegten Angaben: Kennzahlen, Hundezonen, Regeln, Wege, Tierschutz, Termine, Bahn, FAQ und Quellen", async () => {
  for (const page of data.pages) {
    const { guide } = page;
    assert.ok(guide, `${page.slug}: Stadtführer fehlt`);
    assert.ok(guide.facts.length >= 4, `${page.slug}: Kennzahlen`);
    for (const fact of guide.facts) {
      assert.ok(fact.value && fact.note, `${page.slug}: ${fact.label} ohne Wert/Stand`);
      assert.match(fact.source, /^https:\/\//);
    }
    assert.ok(guide.dogAreas.length >= 2, `${page.slug}: Hundezonen`);
    assert.ok(guide.rules.length >= 2, `${page.slug}: Regeln`);
    assert.ok(guide.walks.length >= 4, `${page.slug}: Spazierwege/Treffpunkte`);
    assert.ok(guide.shelters.length >= 2, `${page.slug}: Tierheime/Tierschutz`);
    for (const place of [...guide.dogAreas, ...guide.shelters]) {
      assert.match(place.address, /\d{4}\s+\S/, `${page.slug}: ${place.name} ohne PLZ/Ort`);
    }
    for (const entry of [...guide.dogAreas, ...guide.walks, ...guide.shelters, ...guide.rules, ...guide.events]) {
      assert.ok(entry.text.length >= 60, `${page.slug}: ${entry.name ?? entry.title} zu knapp`);
      if (entry.url) assert.match(entry.url, /^https:\/\//);
    }
    assert.ok(guide.vet.text.length >= 60, `${page.slug}: Tierarzt-Notdienst`);
    assert.ok(guide.events.length >= 3, `${page.slug}: Termine`);
    assert.ok(guide.rules.some((rule) => /FFS/.test(rule.text)), `${page.slug}: Regel für Hunde im Zug`);
    assert.ok(guide.faq.length >= 4, `${page.slug}: FAQ`);
    assert.ok(guide.sources.length >= 6, `${page.slug}: Quellen`);
    for (const source of guide.sources) assert.match(source.url, /^https?:\/\//);
    // Dauerhaft gültige Inhalte: keine Fahrzeiten, kein Prüfdatum, keine Jahresangaben ab 2025 in Texten (Statistik-Stichtage nur in Kennzahlen und Quellen).
    assert.equal(guide.transport, undefined, `${page.slug}: Bahnzeiten`);
    assert.equal(guide.checked, undefined, `${page.slug}: Prüfdatum`);
    const text = JSON.stringify({ html: page.contentHtml, lead: page.lead, dogAreas: guide.dogAreas, rules: guide.rules, walks: guide.walks, shelters: guide.shelters, vet: guide.vet, events: guide.events, faq: guide.faq });
    assert.doesNotMatch(text.replace(/Ticino in cifre 2026|https?:[^"\s]+/g, ""), /20(?:2[5-9]|[3-9]\d)/, `${page.slug}: Jahresangabe`);
    assert.doesNotMatch(text, /\d+\s*minuti di treno|a \d+ minuti/, `${page.slug}: Fahrzeit`);
    // Keine Telefonnummern im Stadtführer (keine Privatnummern, Notdienst nur als Institution).
    assert.doesNotMatch(JSON.stringify(guide), /\+41|0\d{2} \d{3} \d{2} \d{2}/, `${page.slug}: Telefonnummer`);
    // Fließtext nennt Konkretes: jeder Abschnitt mit Link oder Zahl.
    for (const chunk of page.contentHtml.split("<h2>").slice(1)) assert.match(chunk, /<a href="https:|\d/, `${page.slug}: Abschnitt ohne Beleg`);
  }
  const guideComponent = await readFile(new URL("../components/it/city-guide.tsx", import.meta.url), "utf8");
  // Quellen eingeklappt (details ohne open), 13 px, am Seitenende.
  assert.match(guideComponent, /<details className="itg-sources">/);
  assert.doesNotMatch(guideComponent, /<details[^>]*\bopen\b/);
  const css = await readFile(new URL("../components/it/it-city-guide.css", import.meta.url), "utf8");
  assert.match(css, /\.itg-sources \{[^}]*font-size: 13px/);
  const cityPage = await readFile(new URL("../components/it/city-page.tsx", import.meta.url), "utf8");
  assert.ok(cityPage.indexOf("<ItCitySources") > cityPage.indexOf("tvc-near"), "Quellen stehen am Seitenende");
  const route = await readFile(new URL("../app/market-it/[[...path]]/page.tsx", import.meta.url), "utf8");
  assert.match(route, /cityFaq/, "FAQPage-JSON-LD auch auf Stadtseiten");
});
