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
