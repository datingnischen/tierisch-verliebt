import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8").catch(() => "");
}

test("implements the safe elFlirt-style dynamic ICONY widget", async () => {
  const component = await source("../components/icony-singles-widget.tsx");
  assert.match(component, /gender === "women" \? 2 : 1/);
  assert.match(component, /window\.icony\("get", "activities", "json"/);
  assert.match(component, /sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"/);
  assert.match(component, /referrerPolicy="no-referrer"/);
  assert.match(component, /meta name="referrer" content="no-referrer"/);
  assert.match(component, /Ausführlicher in \{props\.city\} suchen/);
  assert.match(component, /Für Profilvorschauen bitte JavaScript aktivieren/);
  assert.doesNotMatch(component, /allow-same-origin/);
});

test("renders widgets before the editorial copy on DE and AT/CH city routes", async () => {
  const dePage = await source("../app/partnersuche/[slug]/page.tsx");
  const marketPage = await source("../app/market-partnersuche/[market]/[slug]/page.tsx");
  for (const page of [dePage, marketPage]) {
    const widget = page.indexOf("<IconySinglesWidget");
    const content = page.indexOf("dangerouslySetInnerHTML");
    assert.ok(widget >= 0, "city route must render the singles widget");
    assert.ok(content > widget, "singles widget must appear before editorial copy");
  }
});
