import assert from "node:assert/strict";
import test from "node:test";
import {
  BREED_FACTS_MARKER,
  enhanceBreedContent,
  getBreedName,
  getBreedSectionLinks,
  getBreedTraits,
  getLeadText,
  parseBreedProfile,
  pickKeyFacts,
  shortenSectionLabel,
} from "../lib/magazine-breed.ts";

const CHECK = '<img decoding="async" alt="check" src="https://tierisch-verliebt.de/magazin/wp-content/uploads/2019/06/check-icon-16.png">';

// Format fast aller Rassenseiten (z. B. Britisch Kurzhaar, Kangal)
const HEADING_FORMAT = `<h2>Kurzbeschreibung</h2>
<p>Diese sanftmütigen Stubentiger haben Katzenliebhaber dem Zufall zu verdanken.</p>

<h2>Steckbrief</h2>
<p>${CHECK} <strong>Name</strong>: Britisch Kurzhaar (Abkürzung: BKH)<br />
${CHECK} <strong>Herkunft</strong>: England (Großbritannien)<br />
${CHECK} <strong>Lebenserwartung:</strong> 12 bis 18 Jahre<br />
${CHECK} <strong>Gewicht</strong>: 3 &#8211; 7kg<br />
${CHECK} <strong>FCI-Gruppe:</strong> <a href="https://tierisch-verliebt.de/magazin/fci-gruppen/">FCI-Gruppe 2</a><br />
${CHECK} <strong>Charakter</strong>: ruhig, zufrieden und entspannt</p>
<h2>Farben und Farbkombinationen bei Britisch Kurzhaar</h2>
<p>Text</p>
<h2><img src="https://example.com/bkh.png" alt="BKH"></h2>
<h2>Die folgenden Krankheiten treten bei Zucht-Katzen häufiger auf</h2>
<h2>FAQ</h2>`;

// Format der Barsoi-Seite
const STRONG_LIST_FORMAT = `<p>Intro</p><p><strong>Steckbrief</strong></p>
<ul>
<li>Lebenserwartung: 7 bis 12 Jahre</li>
<li>Gewicht Hündin: 34 kg</li>
<li>Schulterhöhe Rüde: 74 cm</li>
<li>Herkunftsland: Russland</li>
</ul>
<h2>Wesen und Charakter</h2>`;

test("parses the heading + paragraph format with check icons", () => {
  const profile = parseBreedProfile(HEADING_FORMAT);
  assert.ok(profile);
  assert.deepEqual(
    profile.facts.map((fact) => fact.label),
    ["Name", "Herkunft", "Lebenserwartung", "Gewicht", "FCI-Gruppe", "Charakter"],
  );
  assert.equal(profile.facts[0].valueText, "Britisch Kurzhaar (Abkürzung: BKH)");
  assert.equal(profile.facts[3].valueText, "3 – 7kg");
  assert.match(profile.facts[4].valueHtml, /<a href="https:\/\/tierisch-verliebt\.de\/magazin\/fci-gruppen\/">/);
  assert.ok(profile.content.includes(BREED_FACTS_MARKER));
  assert.doesNotMatch(profile.content, /check-icon/);
});

test("parses the strong + list format", () => {
  const profile = parseBreedProfile(STRONG_LIST_FORMAT);
  assert.ok(profile);
  assert.equal(profile.facts.length, 4);
  assert.equal(profile.facts[3].label, "Herkunftsland");
});

test("dash lines and sentences without label are kept as notes", () => {
  const html = `<h2>Steckbrief</h2><p>&#8211; Lebenserwartung: 12-15 Jahre<br />
&#8211; Der Whippet ist bis zum 12. Lebensmonat ausgewachsen<br />
&#8211; Gewicht: 11 bis 25 kg<br />
&#8211; Herkunft: England</p>`;
  const profile = parseBreedProfile(html);
  assert.ok(profile);
  assert.equal(profile.facts[0].label, "Lebenserwartung");
  assert.equal(profile.facts[1].label, "");
  assert.match(profile.facts[1].valueText, /Lebensmonat/);
});

test("a steckbrief heading followed by prose is not a breed profile", () => {
  const html = "<h2>Steckbrief: Färbung, Größe, Unterschied zwischen Männchen und Weibchen</h2><p>Ursprünglich waren alle Wellensittiche grün-gelb gefärbt. Inzwischen gibt es Farben: weiß, blau.</p>";
  assert.equal(parseBreedProfile(html), null);
  assert.equal(parseBreedProfile("<h2>Katzenrassen</h2><p>Übersicht</p>"), null);
});

test("key facts follow priority and traits are split", () => {
  const profile = parseBreedProfile(HEADING_FORMAT);
  assert.deepEqual(
    pickKeyFacts(profile.facts).map((fact) => fact.label),
    ["Herkunft", "Lebenserwartung", "Gewicht"],
  );
  assert.deepEqual(getBreedTraits(profile.facts), ["ruhig", "zufrieden", "entspannt"]);
});

test("lead text skips the Kurzbeschreibung heading", () => {
  assert.equal(getLeadText(HEADING_FORMAT), "Diese sanftmütigen Stubentiger haben Katzenliebhaber dem Zufall zu verdanken.");
});

test("breed name and section labels are derived from the title", () => {
  assert.equal(getBreedName("Britisch Kurzhaar – Die beliebteste Katze"), "Britisch Kurzhaar");
  assert.equal(getBreedName("Windhund Barsoi: Russlands blitzschneller Jäger"), "Windhund Barsoi");
  assert.equal(shortenSectionLabel("Herkunft und Geschichte von Britisch Kurzhaar", "Britisch Kurzhaar"), "Herkunft und Geschichte");
  assert.equal(
    shortenSectionLabel("Die folgenden Krankheiten treten bei Zucht-Katzen häufiger auf", "Britisch Kurzhaar"),
    "Die folgenden Krankheiten treten bei Zucht-Katzen häufiger auf",
  );
  assert.equal(
    shortenSectionLabel("Überlegungen vor der Anschaffung einer Britisch Kurzhaar", "Britisch Kurzhaar"),
    "Überlegungen vor der Anschaffung einer Britisch Kurzhaar",
  );

  const links = getBreedSectionLinks(HEADING_FORMAT, "Britisch Kurzhaar");
  assert.deepEqual(
    links.map((link) => link.label),
    ["Farben und Farbkombinationen", "Die folgenden Krankheiten treten bei Zucht-Katzen häufiger auf"],
  );
});

test("enhanced content renders the facts card and anchors every section", () => {
  const html = enhanceBreedContent(parseBreedProfile(HEADING_FORMAT), "Britisch Kurzhaar");
  assert.doesNotMatch(html, /Kurzbeschreibung/);
  assert.match(html, /<section class="breed-facts-card" id="steckbrief">/);
  assert.match(html, /Britisch Kurzhaar auf einen Blick/);
  assert.match(html, /<ul class="breed-trait-list"><li>ruhig<\/li>/);
  assert.match(html, /<h2 id="farben-und-farbkombinationen-bei-britisch-kurzhaar" class="breed-section-title">/);
  assert.match(html, /<figure class="breed-inline-media"><img src="https:\/\/example\.com\/bkh\.png"/);
  for (const link of getBreedSectionLinks(HEADING_FORMAT, "Britisch Kurzhaar")) {
    assert.match(html, new RegExp(`id="${link.id}"`));
  }
});
