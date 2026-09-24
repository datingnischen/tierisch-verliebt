import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSiteGraph } from "../lib/site-entities.ts";

const siteUrl = "https://tierisch-verliebt.vercel.app";
const readRepoFile = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the site graph links operator, brand channels and website", () => {
  const sameAs = ["https://www.instagram.com/tierischverliebtde/", "https://de.pinterest.com/tierischverliebt/"];
  const graph = buildSiteGraph({
    siteUrl,
    sameAs,
    page: { type: "AboutPage", url: `${siteUrl}/ueber-uns`, name: "Über uns", description: "Beschreibung" },
  });

  assert.deepEqual(graph["@graph"].map((node) => node["@type"]), ["Organization", "Brand", "WebSite", "AboutPage"]);
  const [operator, brand, website, page] = graph["@graph"];
  assert.equal(operator.name, "ICONY GmbH");
  assert.equal(brand["@id"], `${siteUrl}#brand`);
  assert.deepEqual(brand.sameAs, sameAs);
  assert.equal(website.publisher["@id"], operator["@id"]);
  assert.equal(website.about["@id"], brand["@id"]);
  assert.equal(page.isPartOf["@id"], website["@id"]);
  assert.equal(page.about["@id"], brand["@id"]);
});

test("the site graph stays page-less when no page is passed", () => {
  const graph = buildSiteGraph({ siteUrl, sameAs: [] });
  assert.equal(graph["@graph"].length, 3);
});

test("the brand sameAs comes from every official social channel", () => {
  const component = readRepoFile("components/site-json-ld.tsx");
  assert.match(component, /sameAs: SOCIAL_CHANNELS\.map\(\(channel\) => channel\.href\)/);
  const channels = readRepoFile("lib/social-channels.ts");
  for (const href of [
    "https://www.instagram.com/tierischverliebtde/",
    "https://www.tiktok.com/@tierisch_verliebt",
    "https://www.facebook.com/tierischverliebt",
    "https://www.youtube.com/@tierischverliebt",
    "https://de.pinterest.com/tierischverliebt/",
  ]) {
    assert.ok(channels.includes(`href: "${href}"`), href);
  }
});

test("home, about and social media pages render the site graph", () => {
  for (const path of ["app/page.tsx", "app/ueber-uns/page.tsx", "app/ueber-uns/social-media/page.tsx"]) {
    assert.match(readRepoFile(path), /<SiteJsonLd/, path);
  }
});
