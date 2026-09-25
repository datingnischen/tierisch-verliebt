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
  assert.equal(publicUrl("at", "/partnersuche/wien"), "https://tierisch-verliebt.at/partnersuche/wien/");
  assert.equal(publicUrl("de", "/partnersuche/berlin"), "https://tierisch-verliebt.de/partnersuche/berlin/");
});

test("public page URLs end with a slash, files stay without", async () => {
  const { publicUrl, withTrailingSlash } = await loadMarkets();
  assert.equal(publicUrl("ch"), "https://tierisch-verliebt.ch/");
  assert.equal(publicUrl("de", "/registration/?AID=location"), "https://tierisch-verliebt.de/registration/?AID=location");
  assert.equal(publicUrl("de", "/?AID=magazin"), "https://tierisch-verliebt.de/?AID=magazin");
  assert.equal(publicUrl("at", "/sitemap.xml"), "https://tierisch-verliebt.at/sitemap.xml");
  assert.equal(publicUrl("de", "/datenschutz.html"), "https://tierisch-verliebt.de/datenschutz.html");
  assert.equal(withTrailingSlash("/magazin/zwergspitz?x=1#faq"), "/magazin/zwergspitz/?x=1#faq");
  assert.equal(withTrailingSlash("/app-assets/brand/icon.png"), "/app-assets/brand/icon.png");
});

test("routes prefixed DE plus hidden AT/CH previews", async () => {
  const { resolveMarketRequest } = await loadMarkets();
  assert.deepEqual(resolveMarketRequest("/partnersuche"), { action: "rewrite", market: "de", pathname: "/partnersuche" });
  assert.deepEqual(resolveMarketRequest("/de/partnersuche"), { action: "rewrite", market: "de", pathname: "/partnersuche" });
  assert.deepEqual(resolveMarketRequest("/de/partnersuche/duesseldorf"), { action: "rewrite", market: "de", pathname: "/partnersuche/duesseldorf" });
  assert.deepEqual(resolveMarketRequest("/at/partnersuche"), { action: "market-partnersuche", market: "at", pathname: "/market-partnersuche/at" });
  assert.deepEqual(resolveMarketRequest("/ch/partnersuche/zuerich"), { action: "market-partnersuche-city", market: "ch", pathname: "/market-partnersuche/ch/zuerich", slug: "zuerich" });
});

test("keeps each production country host authoritative", async () => {
  const { resolveMarketRequest } = await loadMarkets();
  assert.deepEqual(resolveMarketRequest("/partnersuche/wien", "tierisch-verliebt.at"), { action: "market-partnersuche-city", market: "at", pathname: "/market-partnersuche/at/wien", slug: "wien" });
  assert.deepEqual(resolveMarketRequest("/de/partnersuche/duesseldorf", "tierisch-verliebt.de"), { action: "rewrite", market: "de", pathname: "/partnersuche/duesseldorf" });
  assert.deepEqual(resolveMarketRequest("/de/partnersuche/zuerich", "tierisch-verliebt.ch"), { action: "market-partnersuche-city", market: "ch", pathname: "/market-partnersuche/ch/zuerich", slug: "zuerich" });
  assert.deepEqual(resolveMarketRequest("/market-partnersuche/at", "tierisch-verliebt.vercel.app"), { action: "not-found" });
});

test("routes market robots and sitemaps", async () => {
  const { resolveMarketRequest } = await loadMarkets();
  assert.deepEqual(resolveMarketRequest("/at/robots.txt"), { action: "market-robots", market: "at", pathname: "/market-robots/at" });
  assert.deepEqual(resolveMarketRequest("/ch/sitemap.xml"), { action: "market-sitemap", market: "ch", pathname: "/market-sitemap/ch" });
});
