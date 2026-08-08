import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";

async function handler() {
  try { return await import("../proxy.ts"); }
  catch (error) { assert.fail(`proxy.ts must be executable with real NextRequest objects: ${error.message}`); }
}

test("rejects direct and spoofed internal market implementation paths", async () => {
  const { proxy } = await handler();
  for (const path of ["/market-home/at", "/market-partnersuche/ch", "/market-partnersuche/at/wien", "/market-sitemap/ch"]) {
    const request = new NextRequest(`https://tierisch-verliebt.vercel.app${path}`, { headers: { "x-tv-rewrite-destination": path, "x-tv-rewrite-token": "attacker" } });
    assert.equal(proxy(request).status, 404, path);
  }
});

test("honors the recognized direct country host over a conflicting forwarded host", async () => {
  const { proxy } = await handler();
  const request = new NextRequest("https://tierisch-verliebt.at/partnersuche/wien", { headers: { host: "tierisch-verliebt.at", "x-forwarded-host": "tierisch-verliebt.ch" } });
  const response = proxy(request);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("x-middleware-rewrite") || "", /\/market-partnersuche\/at\/wien$/);
});

test("hands AT and CH platform-owned paths back to the existing legacy platform", async () => {
  const { proxy } = await handler();
  for (const [url, marker] of [
    ["https://tierisch-verliebt.vercel.app/at/registration/", "https://tierisch-verliebt.at/registration"],
    ["https://tierisch-verliebt.at/login/", "https://tierisch-verliebt.at/login"],
    ["https://tierisch-verliebt.ch/suche/", "https://tierisch-verliebt.ch/suche"],
  ]) {
    const response = proxy(new NextRequest(url));
    assert.equal(response.status, 200, url);
    const html = await response.text();
    assert.match(html, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), url);
    assert.match(html, /noindex,nofollow/, url);
  }
});

test("rejects prefixed public-host routes so AT/CH stay prefix-free", async () => {
  const { proxy } = await handler();
  for (const url of [
    "https://tierisch-verliebt.at/at/partnersuche/wien",
    "https://tierisch-verliebt.at/de/partnersuche/wien",
    "https://tierisch-verliebt.ch/ch/partnersuche/zuerich",
  ]) {
    assert.equal(proxy(new NextRequest(url)).status, 404, url);
  }
});
