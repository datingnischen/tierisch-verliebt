import assert from "node:assert/strict";
import test from "node:test";

const EXPECTED = {
  de: ["berlin", "duesseldorf", "stuttgart", "koeln", "muenchen", "hamburg", "dortmund", "essen", "leipzig", "frankfurt-am-main", "bremen", "dresden", "hannover", "nuernberg", "duisburg", "bochum", "wuppertal", "bielefeld", "bonn", "muenster"],
  at: ["graz", "innsbruck", "salzburg", "klagenfurt", "dornbirn", "amstetten", "steyr", "wien", "linz", "st-poelten", "wels", "villach", "bregenz", "leoben", "eisenstadt"],
  ch: ["bern", "basel", "luzern", "st-gallen", "winterthur", "zuerich", "lausanne", "genf", "thun", "schaffhausen", "biel", "chur", "zug", "fribourg", "aarau"],
};

async function loadContent() {
  try {
    return await import("../lib/market-partnersuche.ts");
  } catch (error) {
    assert.fail(`lib/market-partnersuche.ts must expose the complete static city contract: ${error.message}`);
  }
}

for (const market of ["de", "at", "ch"]) {
  test(`publishes the exact ${market.toUpperCase()} legacy city inventory`, async () => {
    const { getMarketCityPages } = await loadContent();
    assert.deepEqual(getMarketCityPages(market).map((page) => page.slug), EXPECTED[market]);
  });
}

test("keeps every imported city complete, sanitized and market-local", async () => {
  const { getMarketCityPages, getMarketPartnersucheHub } = await loadContent();

  for (const market of ["de", "at", "ch"]) {
    const domain = `tierisch-verliebt.${market}`;
    const hub = getMarketPartnersucheHub(market);
    const pages = getMarketCityPages(market);
    assert.equal(hub.cities.length, EXPECTED[market].length);
    assert.ok(hub.editorial.heroImageUrl?.startsWith("https://static-cms.icony-hosting.de/"));
    assert.ok(hub.editorial.introParagraphs.length >= 2);

    for (const page of pages) {
      assert.equal(page.market, market);
      assert.equal(page.path, `/partnersuche/${page.slug}`);
      assert.equal(new URL(page.sourceUrl).hostname, domain);
      assert.ok(page.title.length > 10);
      assert.ok(page.description.length > 40);
      assert.ok(page.cityName.length > 1);
      assert.ok(page.contentHtml.length > 300);
      assert.ok(page.icony.platformId.startsWith("tierischverliebt"));
      assert.ok(page.icony.zip.length >= 4);
      assert.equal(page.icony.country, market === "de" ? 49 : market === "at" ? 43 : 41);
      assert.equal(new URL(page.registrationUrl).hostname, domain);
      assert.equal(new URL(page.searchUrl).hostname, domain);
      assert.doesNotMatch(page.contentHtml, /<(?:script|iframe|form|input|button)\b/i);
      assert.doesNotMatch(page.contentHtml, /\son[a-z]+\s*=/i);
      assert.doesNotMatch(page.contentHtml, /(?:href|src)\s*=\s*["']\s*javascript:/i);
    }
  }
});
