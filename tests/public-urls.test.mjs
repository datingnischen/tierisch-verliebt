import assert from "node:assert/strict";
import test from "node:test";
import { readdir, readFile } from "node:fs/promises";
import { LIVE_ORIGIN, publicUrl } from "../lib/markets.ts";
import { SITE_URL } from "../lib/magazine.ts";

const repoRoot = new URL("../", import.meta.url);

// Nur hier darf der Vercel-Host stehen: Asset-Host und Vorschau-Erkennung.
const VERCEL_ALLOWED = new Set(["lib/static-asset.ts", "lib/markets.ts", "components/market-link.tsx"]);

async function listSourceFiles(dir) {
  const entries = await readdir(new URL(`${dir}/`, repoRoot), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) files.push(...(await listSourceFiles(path)));
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

test("öffentliche Seiten-URLs nutzen die Live-Domain", () => {
  assert.equal(LIVE_ORIGIN, "https://tierisch-verliebt.de");
  assert.equal(SITE_URL, LIVE_ORIGIN);
  assert.equal(publicUrl("de", "/ueber-uns/suche"), "https://tierisch-verliebt.de/ueber-uns/suche/");
  assert.doesNotMatch(SITE_URL, /vercel\.app/);
});

test("keine Canonical-, Sitemap- oder JSON-LD-Quelle nennt den Vercel-Host", async () => {
  const files = [
    ...(await listSourceFiles("app")),
    ...(await listSourceFiles("components")),
    ...(await listSourceFiles("lib")),
  ];
  const offenders = [];
  for (const file of files) {
    if (VERCEL_ALLOWED.has(file)) continue;
    const source = await readFile(new URL(file, repoRoot), "utf8");
    if (/vercel\.app/.test(source)) offenders.push(file);
  }
  assert.deepEqual(offenders, []);
});

test("Sitemap und robots bauen ihre URLs aus SITE_URL", async () => {
  const sitemap = await readFile(new URL("app/sitemap.ts", repoRoot), "utf8");
  const robots = await readFile(new URL("app/robots.ts", repoRoot), "utf8");
  for (const match of sitemap.matchAll(/url:\s*`([^`]*)`/g)) {
    assert.match(match[1], /^\$\{SITE_URL\}/, `Sitemap-URL ohne SITE_URL: ${match[1]}`);
  }
  assert.match(robots, /sitemap: `\$\{SITE_URL\}\/sitemap\.xml`/);
});
