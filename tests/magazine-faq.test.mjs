import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildMagazineFaqGraph,
  getMagazineFaqItems,
  getMagazineFaqSubject,
  renderMagazineFaqSection,
} from "../lib/magazine-faq.ts";

const content = `
<h2>Rassenmerkmale</h2>
<p>Text zur Rasse.</p>
<h2>FAQ</h2>
<h3>Ist der Labrador Retriever f&uuml;r das Stadtleben geeignet?</h3>
<p>Ja, mit genug Bewegung &amp; geistiger Auslastung.</p>
<h3>Wie kann man einen Labrador geistig auslasten?</h3>
<p>Mit Suchspielen und Apportieraufgaben.</p>
`;

test("extracts FAQ pairs from editorial content", () => {
  const items = getMagazineFaqItems(content);
  assert.equal(items.length, 2);
  assert.equal(items[0].question, "Ist der Labrador Retriever für das Stadtleben geeignet?");
  assert.equal(items[0].answerText, "Ja, mit genug Bewegung & geistiger Auslastung.");
  assert.deepEqual(items.map((item) => item.id), ["faq-frage-1", "faq-frage-2"]);
});

test("FAQ extraction stops at the next section heading", () => {
  const items = getMagazineFaqItems(`${content}<h2>Weiter im Text</h2><h3>Keine Frage</h3><p>Kein FAQ.</p>`);
  assert.equal(items.length, 2);
});

test("renders the FAQ accordion card in place of the plain heading list", () => {
  const html = renderMagazineFaqSection(content, getMagazineFaqSubject("Labrador Retriever – Das Portrait"));
  assert.match(html, /<section class="breed-faq-card" id="faq"/);
  assert.match(html, /<details class="breed-faq-item" id="faq-frage-1" open>/);
  assert.match(html, /<details class="breed-faq-item" id="faq-frage-2">/);
  assert.match(html, /Die häufigsten Fragen zum Thema „Labrador Retriever“/);
  assert.ok(!/<h2>FAQ<\/h2>/.test(html));
  assert.match(html, /<h2>Rassenmerkmale<\/h2>/);
});

test("content without an FAQ section stays untouched", () => {
  const plain = "<h2>Charakter</h2><p>Freundlich.</p>";
  assert.equal(renderMagazineFaqSection(plain, "Labrador"), plain);
  assert.equal(buildMagazineFaqGraph({ items: [], pageUrl: "https://x.de/magazin/a", pageName: "A" }), null);
});

test("builds FAQPage schema from the extracted questions", () => {
  const graph = buildMagazineFaqGraph({
    items: getMagazineFaqItems(content),
    pageUrl: "https://tierisch-verliebt.vercel.app/magazin/labrador-retriever",
    pageName: "Häufige Fragen zu Labrador Retriever – Das Portrait",
  });

  assert.equal(graph["@type"], "FAQPage");
  assert.equal(graph["@id"], "https://tierisch-verliebt.vercel.app/magazin/labrador-retriever#faq");
  assert.equal(graph.inLanguage, "de-DE");
  assert.equal(graph.mainEntity.length, 2);
  assert.equal(graph.mainEntity[0]["@type"], "Question");
  assert.equal(graph.mainEntity[0].acceptedAnswer["@type"], "Answer");
  assert.equal(graph.mainEntity[0].acceptedAnswer.text, "Ja, mit genug Bewegung & geistiger Auslastung.");
});

test("subject keeps the topic without the editorial title suffix", () => {
  assert.equal(getMagazineFaqSubject("Labrador Retriever – Das Portrait"), "Labrador Retriever");
  assert.equal(getMagazineFaqSubject("Barsoi &#8211; Das Portrait"), "Barsoi");
  assert.equal(getMagazineFaqSubject("Katzen im Alltag"), "Katzen im Alltag");
});

test("magazine detail pages render the FAQ card and its schema for every article", async () => {
  const page = await readFile(new URL("../app/magazin/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /renderMagazineFaqSection\(enhancedContent, getMagazineFaqSubject\(entry\.title\)\)/);
  assert.match(page, /const faqItems = getMagazineFaqItems\(entry\.content\)/);
  assert.match(page, /buildMagazineFaqGraph\(\{/);
  assert.match(page, /faqGraph \? \(/);
  assert.match(page, /serializeJsonLd\(faqGraph\)/);
});
