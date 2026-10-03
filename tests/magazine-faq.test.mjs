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

test("Dutch FAQ cards and schema keep the questions and use the Dutch locale", () => {
  const html = renderMagazineFaqSection(content, "Bengaal", "nl-NL");
  assert.match(html, /Veelgestelde vragen/);
  assert.doesNotMatch(html, /Häufige Fragen|Die häufigsten Fragen/);
  assert.equal((html.match(/<details /g) || []).length, getMagazineFaqItems(content).length);
  const graph = buildMagazineFaqGraph({ items: getMagazineFaqItems(content), pageUrl: "https://tierisch-verliebt.nl/magazin/bengaal/", pageName: "Bengaal", language: "nl-NL" });
  assert.equal(graph.inLanguage, "nl-NL");
  assert.equal(graph.mainEntity[0].name, getMagazineFaqItems(content)[0].question);
});

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

test("recognises bold paragraph questions under an FAQ heading (Blue Lacy format)", () => {
  const html = `<h2>Ernährung</h2><p>Futter.</p>
<h2>FAQ</h2>
<p><strong>Wie viel Pflege benötigt ein Blue Lacy?</strong></p>
<p>Wenig.</p>
<p><strong>Tipp:</strong> Einmal pro Woche bürsten.</p>
<p><strong>Sind Blue Lacys familienfreundlich?</strong></p>
<p>Ja.</p>`;
  const items = getMagazineFaqItems(html);
  assert.deepEqual(items.map((item) => item.question), ["Wie viel Pflege benötigt ein Blue Lacy?", "Sind Blue Lacys familienfreundlich?"]);
  assert.match(items[0].answerHtml, /Tipp:/);
});

test("recognises inline questions with a line break before the answer (Cornish Rex format)", () => {
  const html = `<h2>FAQ</h2><p data-start="1"><strong data-start="2">Ist die Cornish Rex für Allergiker geeignet?</strong><br data-start="3">Nicht automatisch.</p>`;
  const [item] = getMagazineFaqItems(html);
  assert.equal(item.question, "Ist die Cornish Rex für Allergiker geeignet?");
  assert.equal(item.answerHtml, "<p>Nicht automatisch.</p>");
});

test("accepts FAQ`s, Häufig gestellte Fragen and h1/h3 FAQ headings", () => {
  for (const heading of ["<h2>FAQ`s</h2>", "<h1>FAQ`s</h1>", "<h2>Häufig gestellte Fragen</h2>", "<h3>FAQ</h3>", "<h2>FAQ&#8217;s</h2>"]) {
    const items = getMagazineFaqItems(`${heading}<h3>Wird ein Mops alt?</h3><p>Ja.</p><h4>Haart ein Mops?</h4><p>Ja.</p>`);
    assert.equal(items.length, 2, heading);
  }
  assert.equal(getMagazineFaqItems("<h2>Häufige Krankheiten</h2><h3>HD?</h3><p>Ja.</p>").length, 0);
});

test("an h3 FAQ section keeps h3 questions and ends at the next non-question h3", () => {
  const html = "<h3>FAQ</h3><h3>Ist sie selten?</h3><p>Ja.</p><h3>Quellen</h3><p>Liste</p>";
  const items = getMagazineFaqItems(html);
  assert.equal(items.length, 1);
  assert.match(renderMagazineFaqSection(html, "Korat"), /<h3>Quellen<\/h3><p>Liste<\/p>$/);
});

test("content before the first question stays in front of the FAQ card", () => {
  const html = `<h2>FAQ\`s</h2><p><img src="a.jpg"></p><h3>Ist der Pitbull ein Listenhund?</h3><p>In vielen Bundesländern.</p>`;
  const rendered = renderMagazineFaqSection(html, "Pitbull");
  assert.match(rendered, /^<p><img src="a\.jpg"><\/p>\n<section class="breed-faq-card"/);
});
