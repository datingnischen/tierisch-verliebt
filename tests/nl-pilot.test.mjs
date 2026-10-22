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

test("NL info pages resolve on preview and production host; platform paths go to tierisch-verliebt.de", async () => {
  for (const path of ["/over-ons/", "/privacy/", "/colofon/"]) {
    assert.deepEqual(resolveMarketRequest(`/nl${path}`, "tierisch-verliebt.vercel.app"), resolveMarketRequest(path, "tierisch-verliebt.nl"));
    assert.equal(resolveMarketRequest(path, "tierisch-verliebt.nl").action, "nl-pilot");
  }
  for (const [path, host] of [["/nl/registration", "tierisch-verliebt.vercel.app"], ["/registration/", "tierisch-verliebt.nl"], ["/login", "tierisch-verliebt.nl"]]) {
    const resolution = resolveMarketRequest(path, host);
    assert.equal(resolution.action, "redirect-platform");
    assert.match(resolution.url, /^https:\/\/tierisch-verliebt\.de\/(?:registration|login)\/$/);
  }
});

test("NL indexing switch: noindex, robots and sitemap stay closed until the domain is live", async () => {
  const { NL_PILOT_INDEXABLE, nlSitemapPaths } = await import("../lib/nl-routes.ts");
  const paths = nlSitemapPaths(["amsterdam"]);
  if (NL_PILOT_INDEXABLE) {
    assert.ok(paths.includes("/over-ons") && paths.includes("/partnersuche/amsterdam"));
    assert.ok(!paths.includes("/privacy") && !paths.includes("/colofon") && !paths.includes("/partnersuche"));
  } else assert.deepEqual(paths, []);
  const fs = await import("node:fs");
  const page = fs.readFileSync(new URL("../app/market-nl/[[...path]]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /index: indexable/);
  assert.match(page, /NL_LEGAL_PAGES\.includes/);
});

test("NL pages link registration and login to tierisch-verliebt.de, never to the unregistered .nl platform", async () => {
  const fs = await import("node:fs");
  for (const file of ["components/nl/site-shell.tsx", "components/nl/city-hub.tsx", "components/nl/city-page.tsx", "components/nl/magazine.tsx", "components/nl/info-pages.tsx", "components/sticky-cta-button.tsx", "lib/market-partnersuche.ts"]) {
    const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /tierisch-verliebt\.nl\/(?:registration|login|suche|datenschutz|impressum)/, file);
    assert.doesNotMatch(source, /publicUrl\("nl", "\/(?:registration|login|datenschutz|impressum)/, file);
    assert.doesNotMatch(source, /bij de lancering/, file);
  }
  const privacy = fs.readFileSync(new URL("../components/nl/info-pages.tsx", import.meta.url), "utf8");
  for (const needle of ["Vercel Web Analytics", "24 uur", "youtube-nocookie", "Autoriteit Persoonsgegevens"]) assert.ok(privacy.includes(needle), needle);
});

test("NL footer links the live domains with flags; live DE/AT/CH footers link NL only after release", async () => {
  const fs = await import("node:fs");
  const nl = fs.readFileSync(new URL("../components/nl/site-shell.tsx", import.meta.url), "utf8");
  assert.match(nl, /<MarketFlag market=\{market\}\/>/);
  assert.match(nl, /aria-label=\{`\$\{COUNTRY_NL\[market\]\}: \$\{getMarket\(market\)\.domain\}`\}/);
  assert.doesNotMatch(nl, /<MarketLink market="nl" path="\/">NL<\/MarketLink>/);
  const live = fs.readFileSync(new URL("../components/site-shell.tsx", import.meta.url), "utf8");
  assert.match(live, /NL_PILOT_INDEXABLE \? <a href=\{publicUrl\("nl"\)\}/);
  const { NL_PILOT_INDEXABLE } = await import("../lib/nl-routes.ts");
  assert.equal(NL_PILOT_INDEXABLE, false, "NL ist Pilot: kein Link aus den Live-Footern, bis Christian die Domain freigibt");
});
