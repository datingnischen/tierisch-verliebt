import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function source() {
  return readFile(new URL("../components/site-shell.tsx", import.meta.url), "utf8");
}

test("uses explicit market-specific logo assets for DE, AT and CH", async () => {
  const content = await source();
  assert.match(content, /logoByMarket: Record<MarketCode, \{ src: string; alt: string \}>/);
  assert.match(content, /de:[\s\S]*tierischverliebt\/logo\.svg/);
  assert.match(content, /at:[\s\S]*tierischverliebtat\/logo\.svg/);
  assert.match(content, /ch:[\s\S]*tierischverliebtch\/logo\.svg/);
  assert.match(content, /const logo = logoByMarket\[market\]/);
  assert.match(content, /src=\{logo\.src\} alt=\{logo\.alt\}/);
});
