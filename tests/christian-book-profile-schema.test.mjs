import test from "node:test";
import assert from "node:assert/strict";
import { buildChristianBookProfileGraph, stripPublishedBookSchema } from "../lib/christian-book-profile-schema.ts";
import { serializeJsonLd } from "../lib/json-ld.ts";

const markerContent = `
<p>Profiltext</p>
<!-- dating-ohne-bullshit-book:start -->
<figure><img src="https://tierisch-verliebt.de/magazin/wp-content/uploads/2026/08/dating-ohne-bullshit.jpg" alt="Dating ohne Bullshit"></figure>
<!-- dating-ohne-bullshit-book:end -->
`;

const base = {
  christianSlug: "christian",
  canonicalUrl: "https://tierisch-verliebt.vercel.app/magazin/christian",
  profileName: "Christian M. Haas",
  profileDescription: "Datingexperte und Tierliebhaber",
  breadcrumbRootName: "Magazin",
  breadcrumbRootUrl: "https://tierisch-verliebt.vercel.app/magazin",
};

test("builds the Christian CMS-gated profile and book graph", () => {
  const graph = buildChristianBookProfileGraph({ ...base, slug: "christian", content: markerContent });
  assert.ok(graph);
  assert.equal(graph["@context"], "https://schema.org");
  assert.deepEqual(graph["@graph"].map((node) => node["@type"]), ["BreadcrumbList", "ProfilePage", "Person", "Book"]);

  const [breadcrumb, profile, person, book] = graph["@graph"];
  assert.equal(breadcrumb.itemListElement.length, 2);
  assert.equal(profile.mainEntity["@id"], `${base.canonicalUrl}#person`);
  assert.equal(person["@id"], `${base.canonicalUrl}#person`);
  assert.equal(book.author["@id"], `${base.canonicalUrl}#person`);
  assert.deepEqual(
    {
      name: book.name,
      alternateName: book.alternateName,
      isbn: book.isbn,
      datePublished: book.datePublished,
      inLanguage: book.inLanguage,
      bookFormat: book.bookFormat,
      numberOfPages: book.numberOfPages,
      url: book.url,
      image: book.image,
    },
    {
      name: "Dating ohne Bullshit",
      alternateName: "Der ungeschönte Insiderblick ins Online-Dating-Business",
      isbn: "9783696371210",
      datePublished: "2026-08-21",
      inLanguage: "de-DE",
      bookFormat: "https://schema.org/Paperback",
      numberOfPages: 136,
      url: "https://www.amazon.de/dp/3696371211/",
      image: "https://tierisch-verliebt.de/magazin/wp-content/uploads/2026/08/dating-ohne-bullshit.jpg",
    },
  );
});

test("suppresses the graph outside the exact Christian CMS marker boundary", () => {
  assert.equal(buildChristianBookProfileGraph({ ...base, slug: "ordinary-post", content: markerContent }), null);
  assert.equal(buildChristianBookProfileGraph({ ...base, slug: "christian", content: "<p>Kein Marker</p>" }), null);
  assert.equal(buildChristianBookProfileGraph({ ...base, slug: "christian", content: `${markerContent}${markerContent}` }), null);
  assert.equal(buildChristianBookProfileGraph({
    ...base,
    slug: "christian",
    content: "<!-- dating-ohne-bullshit-book:start --><img src=\"javascript:alert(1)\"><!-- dating-ohne-bullshit-book:end -->",
  }), null);
});

test("uses the safe JSON-LD serializer", () => {
  assert.equal(
    serializeJsonLd({ value: "<script>&>\u2028\u2029" }),
    '{"value":"\\u003cscript\\u003e\\u0026\\u003e\\u2028\\u2029"}',
  );
});

test("removes the CMS Book script before rendering to avoid duplicate Book nodes", () => {
  const content = 'before<!-- dating-ohne-bullshit-schema:start --><script type="application/ld+json">{"@type":"Book"}</script><!-- dating-ohne-bullshit-schema:end -->after';
  assert.equal(stripPublishedBookSchema(content), "beforeafter");
});

test("the Christian magazine page emits the single CMS-gated graph", async () => {
  const { readFile } = await import("node:fs/promises");
  const page = await readFile(new URL("../app/magazin/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /buildChristianBookProfileGraph\(\{/);
  assert.match(page, /slug,\s*christianSlug: "christian",\s*content: entry\.content/);
  assert.match(page, /profileGraph \? \(/);
  assert.match(page, /serializeJsonLd\(profileGraph\)/);
  assert.match(page, /stripPublishedBookSchema\(renderedContent\)/);
  assert.doesNotMatch(page, /const christianStructuredData/);
});
