import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("uses explicit market-specific logo assets for DE, AT and CH", async () => {
  const content = await source("../components/site-shell.tsx");
  assert.match(content, /logoByMarket: Record<MarketCode, \{ src: string; alt: string \}>/);
  assert.match(content, /de: \{\s*src: staticAsset\("\/brand\/tierisch-verliebt-logo-de\.svg"\)/);
  assert.match(content, /at: \{\s*src: staticAsset\("\/brand\/tierisch-verliebt-logo-at\.svg"\)/);
  assert.match(content, /ch: \{\s*src: staticAsset\("\/brand\/tierisch-verliebt-logo-ch\.svg"\)/);
  assert.doesNotMatch(content, /icony-hosting/, "Logos liegen im Repo (public/brand), nicht im ICONY-CMS");
  assert.match(content, /const logo = logoByMarket\[market\]/);
  assert.match(content, /src=\{logo\.src\} alt=\{logo\.alt\}/);
});

test("city routes switch shell registration CTAs to AID=location", async () => {
  const shell = await source("../components/site-shell.tsx");
  const sticky = await source("../components/sticky-cta-button.tsx");
  assert.match(shell, /function isCityPage\(pathname: string\)/);
  assert.match(shell, /\^\\\/\(\?:\(\?:de\|at\|ch\)\\\/\)\?partnersuche\\\/\[a-z0-9-\]\+\\\/\?\$\/i/);
  assert.match(shell, /publicUrl\(market, isCityPage\(pathname\) \? "\/registration\/\?AID=location" : "\/\?AID=magazin"\)/);
  assert.match(sticky, /publicUrl\(market,cityIntent\?'\/registration\/\?AID=location':'\/\?AID=magazin'\)/);
});

test("footer keeps legal links on live market domains and market switch links absolute without NL", async () => {
  const shell = await source("../components/site-shell.tsx");
  assert.doesNotMatch(shell, /function legalHref\(/);
  assert.ok(shell.includes('href={publicUrl(market, "/datenschutz.html")}'));
  assert.ok(shell.includes('href={publicUrl(market, "/impressum.html")}'));
  for (const market of ["de", "at", "ch"]) {
    assert.ok(shell.includes(`href={publicUrl("${market}")}`));
  }
  assert.doesNotMatch(shell, /marketSwitchHref/);
  assert.doesNotMatch(shell, /<MarketLink market="nl"/);
});

test("NL uses its own logo files like DE/AT/CH (header and light footer variant)", async () => {
  const nl = await source("../components/nl/site-shell.tsx");
  assert.match(nl, /staticAsset\(`\/brand\/tierisch-verliebt-logo-\$\{light \? "light-" : ""\}nl\.svg`\)/);
  for (const file of ["tierisch-verliebt-logo-nl.svg", "tierisch-verliebt-logo-light-nl.svg"]) {
    const svg = await source(`../public/brand/${file}`);
    assert.match(svg, /^<svg [^>]*viewBox=/, file);
    assert.ok(svg.length > 20000, `${file}: Wortmarke und Claim als Pfade`);
  }
});
