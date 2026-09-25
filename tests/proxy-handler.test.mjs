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
  const request = new NextRequest("https://tierisch-verliebt.at/partnersuche/wien/", { headers: { host: "tierisch-verliebt.at", "x-forwarded-host": "tierisch-verliebt.ch" } });
  const response = proxy(request);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("x-middleware-rewrite") || "", /\/market-partnersuche\/at\/wien\/?$/);
});

function slashRedirect(proxy, url, headers = {}) {
  const response = proxy(new NextRequest(url, { headers }));
  return { status: response.status, location: response.headers.get("location") };
}

test("page paths without a trailing slash redirect with 308; internal country prefix goes to the country domain", async () => {
  const { proxy } = await handler();
  const vercel = "https://tierisch-verliebt.vercel.app";
  // nginx ruft für tierisch-verliebt.at/partnersuche/wien hier /at/partnersuche/wien auf: Ziel ist die Landesdomain ohne Präfix.
  assert.deepEqual(slashRedirect(proxy, `${vercel}/at/partnersuche/wien`), { status: 308, location: "https://tierisch-verliebt.at/partnersuche/wien/" });
  assert.deepEqual(slashRedirect(proxy, `${vercel}/ch/partnersuche?ref=start`), { status: 308, location: "https://tierisch-verliebt.ch/partnersuche/?ref=start" });
  assert.deepEqual(slashRedirect(proxy, `${vercel}/at`), { status: 308, location: "https://tierisch-verliebt.at/" });
  assert.deepEqual(slashRedirect(proxy, `${vercel}/de/magazin`), { status: 308, location: "https://tierisch-verliebt.de/magazin/" });
  // Auf einer Landesdomain entscheidet der Host über den Markt, wie beim Routing.
  assert.deepEqual(
    slashRedirect(proxy, `${vercel}/de/partnersuche/zuerich`, { "x-forwarded-host": "tierisch-verliebt.ch" }),
    { status: 308, location: "https://tierisch-verliebt.ch/partnersuche/zuerich/" },
  );
  // Ohne Präfix bleibt die Umleitung auf demselben Host.
  assert.deepEqual(slashRedirect(proxy, `${vercel}/magazin/zwergspitz?x=1`), { status: 308, location: `${vercel}/magazin/zwergspitz/?x=1` });
  assert.deepEqual(slashRedirect(proxy, "https://tierisch-verliebt.at/partnersuche/wien", { host: "tierisch-verliebt.at" }), { status: 308, location: "https://tierisch-verliebt.at/partnersuche/wien/" });
});

test("pages with slash, files and technical paths are not redirected", async () => {
  const { proxy } = await handler();
  for (const path of ["/", "/magazin/", "/at/", "/at/partnersuche/wien/", "/de/magazin/zwergspitz/?x=1", "/at/robots.txt", "/sitemap.xml", "/ch/sitemap.xml", "/app-assets/brand/icon.png", "/api/revalidate", "/.well-known/security.txt"]) {
    const response = proxy(new NextRequest(`https://tierisch-verliebt.vercel.app${path}`));
    assert.notEqual(response.status, 308, path);
    assert.equal(response.headers.get("location"), null, path);
  }
  // Interne Implementierungspfade bleiben 404 statt umgeleitet zu werden.
  assert.equal(proxy(new NextRequest("https://tierisch-verliebt.vercel.app/market-home/at")).status, 404);
});
