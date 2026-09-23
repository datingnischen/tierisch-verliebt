import assert from "node:assert/strict";
import test from "node:test";
import { buildMagazineIndex, countIndexLinks, extractHubLinks, shortPageTitle } from "../lib/magazine-index.ts";

const page = (slug, title, content = "") => ({ id: 0, slug, type: "page", title, excerpt: "", content, categories: [] });
const post = (slug, title, category) => ({ id: 0, slug, type: "post", title, excerpt: "", content: "", date: "2026-01-02", categories: [category] });
const hund = { id: 1, name: "Ratgeber Hund", slug: "ratgeber-hund", description: "", count: 2 };

const hubHtml =
  '<p><a href="https://tierisch-verliebt.de/magazin/maine-coon/">Maine Coon</a>' +
  '<a href="https://tierisch-verliebt.de/magazin/abessinier-katze/">Abessinier</a>' +
  '<a href="https://tierisch-verliebt.de/magazin/gibt-es-nicht/">Weg</a></p>';

test("hub links deliver slug and short label", () => {
  assert.deepEqual(extractHubLinks(hubHtml)[1], { slug: "abessinier-katze", label: "Abessinier" });
});

test("page titles lose portrait suffixes", () => {
  assert.equal(shortPageTitle("Beagle – Das Portrait"), "Beagle");
  assert.equal(shortPageTitle("Portrait zu Hunderasse: Whippet"), "Whippet");
  assert.equal(shortPageTitle("Über uns"), "Über uns");
});

test("index groups every post and page exactly once", () => {
  const pages = [
    page("katzenrassen", "Katzenrassen", hubHtml),
    page("maine-coon", "Maine Coon – Der sanfte Riese"),
    page("maine-coon-pflege", "Die richtige Pflege der Maine Coon"),
    page("abessinier-katze", "Abessinier Katze – Das Portrait"),
    page("ueber-uns", "Über uns"),
  ];
  const posts = [post("gassi", "Gassi-Tipps", hund), post("leine", "Leine", hund)];
  const sections = buildMagazineIndex({ posts, pages, categories: [hund] });

  assert.deepEqual(sections.map((section) => section.id), ["thema-ratgeber-hund", "katzenrassen", "weitere-seiten"]);
  const katzen = sections.find((section) => section.id === "katzenrassen");
  assert.deepEqual(katzen.items.map((item) => item.label), ["Abessinier", "Maine Coon"]);
  assert.equal(katzen.items[1].children[0].href, "/magazin/maine-coon-pflege");
  assert.deepEqual(sections.at(-1).items.map((item) => item.label), ["Katzenrassen", "Über uns"]);
  assert.equal(countIndexLinks(sections), posts.length + pages.length);
});
