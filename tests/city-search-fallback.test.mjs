import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8").catch(() => "");
}

test("city hubs point to the individual ICONY search on the live market domain", async () => {
  const component = await source("../components/city-search-fallback.tsx");
  assert.match(component, /publicUrl\(market, "\/suche\/\?AID=location"\)/);
  assert.match(component, /Individuelle Suche/);
  assert.match(component, /Zur individuellen Suche/);
  assert.doesNotMatch(component, /vercel\.app/);

  const { publicUrl } = await import("../lib/markets.ts");
  for (const market of ["de", "at", "ch"]) {
    assert.equal(publicUrl(market, "/suche/?AID=location"), `https://tierisch-verliebt.${market}/suche/?AID=location`);
  }

  for (const path of ["../app/partnersuche/page.tsx", "../app/market-partnersuche/[market]/page.tsx"]) {
    assert.match(await source(path), /<TierCityHub market=/, `${path} must use the shared city hub`);
  }
  const hub = await source("../components/city-page/tier-city-hub.tsx");
  assert.ok(hub.includes("<CitySearchFallback market={market} />"), "hub must render the search fallback");
  assert.ok(hub.indexOf("<CitySearchFallback") > hub.indexOf("<CityFinder"), "hub must place the fallback below the city grid");
});
