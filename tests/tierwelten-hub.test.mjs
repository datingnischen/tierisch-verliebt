import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { TIERWELT_COUNT, TIERWELT_FAQ, TIERWELT_GROUPS, TIERWELT_MATCHES, findTierwelt } from "../lib/tierwelten.ts";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("tierwelten hub lists every world exactly once with unique slugs", () => {
  const slugs = TIERWELT_GROUPS.flatMap((group) => group.worlds.map((world) => world.slug));
  assert.equal(new Set(slugs).size, slugs.length);
  assert.equal(TIERWELT_COUNT, slugs.length);
  assert.ok(slugs.includes("perserkatze"));
  assert.ok(slugs.includes("reiter-partnersuche"));
});

test("tierwelten matcher only points to existing worlds", () => {
  for (const match of TIERWELT_MATCHES) {
    for (const slug of match.slugs) assert.ok(findTierwelt(slug), `${slug} fehlt in TIERWELT_GROUPS`);
  }
});

test("tierwelten hub keeps the network domains and transparency note", async () => {
  const domains = TIERWELT_GROUPS.flatMap((group) => group.worlds.flatMap((world) => world.domains));
  for (const domain of ["perser-katze.de", "ragdoll.de", "mainecoonkatzen.at", "wildkatze.ch", "reitersingles.de"]) {
    assert.ok(domains.includes(domain), `${domain} fehlt`);
  }
  const page = await source("../app/magazin/tierwelten/page.tsx");
  assert.match(page, /Transparenz-Hinweis zu unserem Netzwerk/);
});

test("tierwelten hub ships its own structured data", async () => {
  const page = await source("../app/magazin/tierwelten/page.tsx");
  assert.match(page, /"@type": "CollectionPage"/);
  assert.match(page, /"@type": "ItemList"/);
  assert.match(page, /"@type": "BreadcrumbList"/);
  assert.match(page, /buildMagazineFaqGraph\(/);
  assert.match(page, /canonical: PAGE_URL/);
  assert.ok(TIERWELT_FAQ.length >= 3);
});
