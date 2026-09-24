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

  for (const [path, market] of [["../app/partnersuche/page.tsx", '"de"'], ["../app/market-partnersuche/[market]/page.tsx", "{market}"]]) {
    const page = await source(path);
    assert.ok(page.includes(`<CitySearchFallback market=${market} />`), `${path} must render the search fallback`);
    assert.ok(page.indexOf("<CitySearchFallback") > page.indexOf('className="city-grid"'), `${path} must place the fallback below the city grid`);
  }
});
