import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { collapseSourceSections } from "../lib/collapse-sources.ts";

const html = [
  "<h2>Stand, Quellen &amp; Transparenz</h2>",
  "<p>Stand der Informationen: Juni 2026</p>",
  "<h3>Genutzte Quellen</h3>",
  '<ul><li><a href="https://www.iucnredlist.org/">iucnredlist.org</a></li></ul>',
  "<h2>Kurz zusammengefasst</h2>",
  "<p>Fazit</p>",
].join("\n");

test("Quellenabschnitt wird zugeklappter Block am Ende des Beitrags", () => {
  const out = collapseSourceSections(html);
  assert.match(out, /<details class="magazine-sources">\n<summary>Quellen &amp; Transparenz<\/summary>/);
  assert.doesNotMatch(out, /<details[^>]*\bopen\b/);
  assert.doesNotMatch(out, /<h2>Stand, Quellen/);
  assert.ok(out.indexOf("Kurz zusammengefasst") < out.indexOf("magazine-sources"), "Quellen stehen am Ende");
  assert.match(out, /href="https:\/\/www\.iucnredlist\.org\/"/, "Links bleiben erhalten");
  assert.match(out, /Stand der Informationen: Juni 2026/);
  assert.match(out, /<p class="magazine-sources__label">Genutzte Quellen<\/p>/);
});

test("Ratgeberfragen und Fließtext mit „Quelle“ bleiben unverändert", () => {
  const text = [
    "<h2>Welche Quellen sind verlässlich?</h2><p>a</p>",
    "<h2>Typische Gefahrenquellen im Käfig</h2><p>b</p>",
    "<p>Karotten sind eine gute Quelle für Ballaststoffe.</p>",
  ].join("");
  assert.equal(collapseSourceSections(text), text);
});

test("FAQ-Karte nach den Quellen bleibt außerhalb des Quellenblocks", () => {
  const out = collapseSourceSections('<h2>Quellen</h2><ul><li>x</li></ul><section class="breed-faq-card"><h2>Häufige Fragen</h2></section>');
  assert.ok(out.indexOf("breed-faq-card") < out.indexOf("magazine-sources"));
});

test("Bildquellen-Absätze wandern bereinigt in den Quellenblock", () => {
  const out = collapseSourceSections(
    "<p>Text</p>\n<p><small>Bildquelle: &lt;https://pixabay.com/photos/x/</small>&gt;</p>\n<h2>FAQ</h2><p>Frage</p>",
  );
  assert.ok(out.indexOf("Frage") < out.indexOf("magazine-sources"));
  assert.match(out, /<div class="magazine-sources__body">\n<p><small>Bildquelle: https:\/\/pixabay\.com\/photos\/x\/<\/small><\/p>/);
  assert.doesNotMatch(out, /&gt;|&lt;/);
});

test("Bildnachweis-Absatz und „Quelle:“ mit Link-Absätzen werden eingesammelt", () => {
  const out = collapseSourceSections(
    '<p class="bildnachweis"><small>Titelbild: <a href="https://commons.wikimedia.org/wiki/File:X.jpg">X</a></small></p><p>Mitte</p><p>Quelle:</p>\n<p>https://www.example.org/a/</p>\n<p>www.example.net/b</p>\n<p>Schluss</p>',
  );
  const sources = out.slice(out.indexOf("<details"));
  assert.match(sources, /Titelbild: <a href="https:\/\/commons\.wikimedia\.org\/wiki\/File:X\.jpg"/);
  assert.match(sources, /<p>Quelle:<\/p>\n<p>https:\/\/www\.example\.org\/a\/<\/p>\n<p>www\.example\.net\/b<\/p>/);
  assert.match(out.slice(0, out.indexOf("<details")), /<p>Mitte<\/p>[\s\S]*<p>Schluss<\/p>/);
});

test("alle Magazininhalte mit Quellen oder Bildnachweis werden eingeklappt", () => {
  const dir = new URL("../content/magazin/", import.meta.url);
  const files = readdirSync(dir).filter((name) => name.endsWith(".md"));
  let withSources = 0;
  for (const name of files) {
    const body = readFileSync(new URL(name, dir), "utf8");
    const hasHeading = /<h[23][^>]*>[^<]*Quellen[^<?]*<\/h[23]>/.test(body);
    const hasCredit = /<p[^>]*>(?:<small>)?\s*(?:Bildquelle|Titelbild|Quelle)\s*:|class="bildnachweis"/.test(body);
    if (!hasHeading && !hasCredit) continue;
    withSources += 1;
    const out = collapseSourceSections(body);
    assert.equal(out.match(/<details class="magazine-sources">/g)?.length, 1, name);
    assert.doesNotMatch(out, /<details class="magazine-sources"[^>]*\bopen\b/, name);
    assert.doesNotMatch(out, /<h[23][^>]*>[^<]*Quellen[^<?]*<\/h[23]>/, name);
    const visible = out.slice(0, out.indexOf('<details class="magazine-sources">'));
    assert.doesNotMatch(visible, /Bildquelle:|class="bildnachweis"/, name);
  }
  assert.ok(withSources >= 20, `nur ${withSources} Beiträge mit Quellen gefunden`);
});

test("Artikelseite nutzt den Quellenblock und sein Stylesheet", () => {
  const page = readFileSync(new URL("../app/magazin/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /collapseSourceSections\(relativizeInternalLinks/);
  assert.match(page, /import "\.\/magazine-sources\.css";/);
  const css = readFileSync(new URL("../app/magazin/[slug]/magazine-sources.css", import.meta.url), "utf8");
  assert.match(css, /details\.magazine-sources > summary \{[^}]*font-size: 13px;[^}]*cursor: pointer;/);
  assert.match(css, /summary:focus-visible \{[^}]*outline:/);
  assert.match(css, /\.magazine-sources__body p,[^{]*\{[^}]*font-size: 13px;/);
});
