import assert from "node:assert/strict";
import test from "node:test";

async function loadMarkets() {
  try {
    return await import("../lib/markets.ts");
  } catch (error) {
    assert.fail(`lib/markets.ts must expose the DE/AT/CH routing contract: ${error.message}`);
  }
}

test("supports the three tierisch-verliebt public markets", async () => {
  const { MARKET_CODES, getMarket, publicUrl } = await loadMarkets();
  assert.deepEqual(MARKET_CODES, ["de", "at", "ch"]);
  assert.equal(getMarket("de").domain, "tierisch-verliebt.de");
  assert.equal(getMarket("at").domain, "tierisch-verliebt.at");
  assert.equal(getMarket("ch").domain, "tierisch-verliebt.ch");
  assert.equal(publicUrl("at", "/partnersuche/wien"), "https://tierisch-verliebt.at/partnersuche/wien");
});

test("routes prefix-free DE and hidden AT/CH previews", async () => {
  const { resolveMarketRequest } = await loadMarkets();
  assert.deepEqual(resolveMarketRequest("/partnersuche"), { action: "rewrite", market: "de", pathname: "/partnersuche" });
  assert.deepEqual(resolveMarketRequest("/at/partnersuche"), { action: "market-partnersuche", market: "at", pathname: "/market-partnersuche/at" });
  assert.deepEqual(resolveMarketRequest("/ch/partnersuche/zuerich"), { action: "market-partnersuche-city", market: "ch", pathname: "/market-partnersuche/ch/zuerich", slug: "zuerich" });
});

test("keeps each production country host authoritative", async () => {
  const { resolveMarketRequest } = await loadMarkets();
  assert.deepEqual(resolveMarketRequest("/partnersuche/wien", "tierisch-verliebt.at"), { action: "market-partnersuche-city", market: "at", pathname: "/market-partnersuche/at/wien", slug: "wien" });
  assert.deepEqual(resolveMarketRequest("/de/partnersuche/zuerich", "tierisch-verliebt.ch"), { action: "market-partnersuche-city", market: "ch", pathname: "/market-partnersuche/ch/zuerich", slug: "zuerich" });
  assert.deepEqual(resolveMarketRequest("/market-partnersuche/at", "tierisch-verliebt.vercel.app"), { action: "not-found" });
});

test("routes market robots and sitemaps", async () => {
  const { resolveMarketRequest } = await loadMarkets();
  assert.deepEqual(resolveMarketRequest("/at/robots.txt"), { action: "market-robots", market: "at", pathname: "/market-robots/at" });
  assert.deepEqual(resolveMarketRequest("/ch/sitemap.xml"), { action: "market-sitemap", market: "ch", pathname: "/market-sitemap/ch" });
});
