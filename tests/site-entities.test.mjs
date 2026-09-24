import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildMagazineArticleGraph, buildSiteGraph } from "../lib/site-entities.ts";

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

test("magazine posts get a BlogPosting with author, category breadcrumb and Berlin dates", () => {
  const url = `${siteUrl}/magazin/hund-und-dating`;
  const graph = buildMagazineArticleGraph({
    siteUrl,
    url,
    type: "post",
    headline: "Hund und Dating",
    description: "Beschreibung",
    image: "https://tierisch-verliebt.de/magazin/wp-content/uploads/hund.jpg",
    datePublished: "2026-05-28T07:05:37",
    dateModified: "2026-12-01T09:00:00",
    author: { name: "Christian M. Haas", url: `${siteUrl}/magazin/christian` },
    category: { name: "Hunde", url: `${siteUrl}/magazin/thema/hunde` },
  });

  const byType = Object.fromEntries(graph["@graph"].map((node) => [node["@type"], node]));
  assert.deepEqual(Object.keys(byType), ["WebPage", "BreadcrumbList", "BlogPosting", "WebSite", "Organization"]);
  const article = byType.BlogPosting;
  assert.equal(article.mainEntityOfPage["@id"], `${url}#webpage`);
  assert.equal(article.author["@id"], `${siteUrl}/magazin/christian#person`);
  assert.equal(article.publisher["@id"], `${siteUrl}#operator`);
  assert.equal(article.isPartOf["@id"], `${siteUrl}#website`);
  assert.equal(article.datePublished, "2026-05-28T07:05:37+02:00");
  assert.equal(article.dateModified, "2026-12-01T09:00:00+01:00");
  assert.equal(byType.WebSite.about["@id"], `${siteUrl}#brand`);
  assert.deepEqual(byType.BreadcrumbList.itemListElement.map((item) => item.name), ["Startseite", "Magazin", "Hunde", "Hund und Dating"]);
});

test("magazine CMS pages stay a WebPage without an article node", () => {
  const graph = buildMagazineArticleGraph({
    siteUrl,
    url: `${siteUrl}/magazin/katzenrassen`,
    type: "page",
    headline: "Katzenrassen",
    description: "Beschreibung",
  });
  const types = graph["@graph"].map((node) => node["@type"]);
  assert.ok(!types.includes("BlogPosting"));
  assert.equal(graph["@graph"][1].itemListElement.length, 3);
});

test("the magazine detail page renders the article graph except on Christian's profile", () => {
  const page = readRepoFile("app/magazin/[slug]/page.tsx");
  assert.match(page, /buildMagazineArticleGraph\(/);
  assert.match(page, /slug === "christian"\s*\?\s*null/);
});
