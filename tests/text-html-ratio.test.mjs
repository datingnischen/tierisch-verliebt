import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Semrush „niedriges Text-HTML-Verhältnis“ (Trello #1262): wiederkehrende SVG-Geometrie nur einmal je Dokument.
const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("city finder and city page render repeated icons via <use> with one symbol set", async () => {
  const finder = await source("components/city-page/city-finder.tsx");
  assert.match(finder, /<IconSymbols names=\{TOPIC_ICON_NAMES\} \/>/);
  assert.match(finder, /<TopicIcon topic=\{topic\} use \/>/);
  assert.match(finder, /<PinIcon use \/>/);
  const page = await source("components/city-page/tier-city-page.tsx");
  assert.match(page, /<IconSymbols names=\{TOPIC_ICON_NAMES\} \/>/);
  assert.ok((page.match(/ use \/>/g) ?? []).length >= 10);
  const icons = await source("components/city-page/tier-icons.tsx");
  assert.match(icons, /<use href=\{`#tvi-\$\{name\}`\} \/>/);
  assert.match(icons, /<symbol key=\{name\} id=\{`tvi-\$\{name\}`\} viewBox=\{viewBoxFor\(name\)\} \{\.\.\.paintFor\(name\)\}>/);
  // Im use-Modus trägt das äußere <svg> keine Strich-Attribute mehr (die stehen am Symbol).
  assert.match(icons, /if \(use\) return <svg className=\{className\} viewBox=\{viewBoxFor\(name\)\} aria-hidden="true"><use /);
});

test("hub map outline is defined once and reused", async () => {
  for (const path of ["components/city-page/tier-city-hub.tsx", "components/nl/city-hub.tsx"]) {
    const hub = await source(path);
    assert.equal((hub.match(/d=\{data\.map\.path\}/g) ?? []).length, 1, path);
    assert.equal((hub.match(/<use href=\{`#tvh-land-\$\{market\}`\}/g) ?? []).length, 2, path);
  }
  const lib = await source("lib/city-hub.ts");
  assert.match(lib, /path: compactMapPath\(map\.path\)/);
});

test("map outlines are compacted to whole units without changing commands", async () => {
  const lib = await source("lib/city-hub.ts");
  const body = lib.slice(lib.indexOf("export function compactMapPath"), lib.indexOf("export function projectPoint"));
  const compactMapPath = new Function(`${body.replace("export function", "function").replace(/: string/g, "")}; return compactMapPath;`)();
  assert.equal(compactMapPath("M406.3,1263.2L388.4,1251.0L388.2,1250.9L371.6,1239.3Z"), "M406,1263L388,1251L372,1239Z");
  const maps = JSON.parse(await readFile(new URL("../data/country-maps.json", import.meta.url), "utf8"));
  for (const [market, map] of Object.entries(maps)) {
    const compact = compactMapPath(map.path);
    assert.ok(compact.length < map.path.length * 0.75, market);
    assert.match(compact, /^[MLZz0-9,-]+$/, market);
    assert.equal((compact.match(/M/g) ?? []).length, (map.path.match(/M/g) ?? []).length, market);
  }
});

test("footer paw geometry is a single symbol", async () => {
  const shell = await source("components/site-shell.tsx");
  assert.equal((shell.match(/<symbol id="tvf-paw"/g) ?? []).length, 1);
  assert.match(shell, /<use href="#tvf-paw" \/>/);
});
