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
