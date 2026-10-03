import assert from "node:assert/strict";
import test from "node:test";
import { getMarket, marketForHostname, previewPathForUrl, publicUrl, resolveMarketRequest } from "../lib/markets.ts";
import { NextRequest } from "next/server.js";
import { proxy, trailingSlashRedirect } from "../proxy.ts";

test("NL pilot has a Dutch locale and public domain", () => {
  assert.equal(marketForHostname("www.tierisch-verliebt.nl"), "nl");
  assert.equal(getMarket("nl").locale, "nl-NL");
  assert.equal(publicUrl("nl", "/magazin/poedel"), "https://tierisch-verliebt.nl/magazin/poedel/");
});

test("NL previews and production host resolve to the same pilot pages", () => {
  for (const path of ["/", "/partnersuche/", "/partnersuche/amsterdam/", "/magazin/", "/magazin/poedel/", "/magazin/hondenrassen/"]) {
    assert.deepEqual(resolveMarketRequest(`/nl${path}`, "tierisch-verliebt.vercel.app"),
      resolveMarketRequest(path, "tierisch-verliebt.nl"));
    assert.equal(resolveMarketRequest(`/nl${path}`).market, "nl");
    assert.ok(resolveMarketRequest(`/nl${path}`).pathname.startsWith("/market-nl"));
  }
});

test("NL article links stay in preview and platform links stay on the public domain", () => {
  assert.equal(previewPathForUrl("https://tierisch-verliebt.nl/magazin/poedel/"), "/nl/magazin/poedel/");
  assert.equal(previewPathForUrl("https://tierisch-verliebt.nl/login/"), null);
  assert.equal(previewPathForUrl("https://tierisch-verliebt.nl/magazin/missing/"), null);
  assert.equal(resolveMarketRequest("/market-nl/partnersuche/").action, "not-found");
  assert.equal(resolveMarketRequest("/nl/market-nl/").action, "not-found");
  assert.equal(resolveMarketRequest("/nl/onbekend/").action, "not-found");
});

test("NL slash normalization stays on preview and recognizes forwarded production hosts", () => {
  const preview = new NextRequest("https://tierisch-verliebt.vercel.app/nl/partnersuche");
  assert.equal(trailingSlashRedirect(preview).headers.get("location"), "https://tierisch-verliebt.vercel.app/nl/partnersuche/");
  const production = new NextRequest("https://tierisch-verliebt.vercel.app/nl/partnersuche", {
    headers: { host: "tierisch-verliebt.vercel.app", "x-forwarded-host": "tierisch-verliebt.nl" },
  });
  assert.equal(trailingSlashRedirect(production).headers.get("location"), "https://tierisch-verliebt.nl/partnersuche/");
  const response = proxy(new NextRequest("https://tierisch-verliebt.vercel.app/nl/magazin/poedel/"));
  assert.match(response.headers.get("x-middleware-rewrite"), /\/market-nl\/magazin\/poedel/);
  assert.equal(response.headers.get("x-middleware-request-x-tv-market"), "nl");
});
