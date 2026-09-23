import assert from "node:assert/strict";
import test from "node:test";
import { getHubLetter, getHubTileFacts, getHubTileTeaser, splitHubLinkList } from "../lib/magazine-hub.ts";

const breeds = ["abessinier-katze", "american-curl", "balinese", "bengal-katze", "burmilla", "chausie", "devon-rex"];
const item = (slug) => `<li><a href="https://tierisch-verliebt.de/magazin/${slug}/">${slug}</a></li>`;

test("nested wordpress link list becomes hub links with surrounding html kept", () => {
  const html = `<p>Intro</p>\n<h3>Rassen:</h3>\n<ol>\n<li style="list-style-type: none;">\n<ol>\n${breeds.map(item).join("\n")}\n</ol>\n</li>\n</ol>\n<h2>Fazit</h2>`;
  const split = splitHubLinkList(html);
  assert.ok(split);
  assert.equal(split.links.length, breeds.length);
  assert.equal(split.links[0].slug, "abessinier-katze");
  assert.equal(split.before.trim(), "<p>Intro</p>");
  assert.equal(split.after.trim(), "<h2>Fazit</h2>");
});

test("only the heading directly above the list is dropped", () => {
  const split = splitHubLinkList(`<h2>Einleitung</h2><p>Text</p><h3>Rassen:</h3><ul>${breeds.map(item).join("")}</ul>`);
  assert.equal(split.before, "<h2>Einleitung</h2><p>Text</p>");
});

test("relative links and short lists", () => {
  assert.ok(splitHubLinkList(`<ul>${breeds.map((slug) => `<li><a href="/magazin/${slug}">${slug}</a></li>`).join("")}</ul>`));
  assert.equal(splitHubLinkList(`<ul>${breeds.slice(0, 3).map(item).join("")}</ul>`), null);
  assert.equal(splitHubLinkList(`<ul>${breeds.map((slug) => `<li>Text <a href="/magazin/${slug}">${slug}</a></li>`).join("")}</ul>`), null);
});

test("steckbrief facts and teaser", () => {
  const facts = getHubTileFacts('<strong>Herkunft</strong>: Kalifornien (USA)<br /><strong>Lebenserwartung</strong>: 10 bis 16 Jahre<br /><strong>Gewicht</strong>: 4,5 &#8211; 6,5 kg<br />');
  assert.deepEqual(facts, { origin: "Kalifornien (USA)", weight: "4,5 – 6,5 kg", lifespan: "10 bis 16 Jahre" });
  assert.deepEqual(getHubTileFacts("<p>nichts</p>"), { origin: undefined, weight: undefined, lifespan: undefined });
  assert.ok(getHubTileTeaser(`<p>${"Wort ".repeat(60)}</p>`).endsWith(" …"));
  assert.equal(getHubLetter("Ägyptische Mau"), "A");
  assert.equal(getHubLetter("Türkisch Van"), "T");
});

test("cover image fallback skips steckbrief check icons", async () => {
  const { getEntryCoverImage } = await import("../lib/wordpress.ts");
  const icon = '<img alt="check" src="https://tierisch-verliebt.de/magazin/wp-content/uploads/2019/06/check-icon-16.png">';
  assert.equal(getEntryCoverImage({ content: `<p>${icon} Name</p>` }), undefined);
  assert.equal(getEntryCoverImage({ content: `<p>${icon}</p><img src="https://x.de/uploads/Korat.jpg" width="800">` }), "https://x.de/uploads/Korat.jpg");
});
