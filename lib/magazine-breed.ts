import { decodeHtmlEntities, stripHtml } from "#wordpress";

export type BreedFact = {
  /** Klartext-Label, z. B. „Lebenserwartung“; leer bei Zeilen ohne „Label: Wert“. */
  label: string;
  /** Wert als HTML – Links (z. B. FCI-Gruppe) bleiben erhalten. */
  valueHtml: string;
  valueText: string;
};

export type BreedProfile = {
  facts: BreedFact[];
  /** Inhalt mit Platzhalter BREED_FACTS_MARKER an der Stelle des alten Steckbriefs. */
  content: string;
};

export type BreedSectionLink = { id: string; label: string };

export const BREED_FACTS_MARKER = "<!--breed-facts-->";

// Drei Formate aus WordPress:
// 1. <h2>Steckbrief</h2><p>✓ <strong>Label</strong>: Wert<br>…</p>  (fast alle Rassen, mit Häkchen-Bildern)
// 2. <p><strong>Steckbrief</strong></p><ul><li>Label: Wert</li>…</ul>  (Barsoi)
// 3. <h2>Steckbrief</h2><ul>…</ul>
const HEADING_PARAGRAPH = /<h([23])[^>]*>((?:(?!<\/h\1>)[\s\S])*?Steckbrief(?:(?!<\/h\1>)[\s\S])*?)<\/h\1>\s*<p>([\s\S]*?)<\/p>/i;
const HEADING_LIST = /<h([23])[^>]*>((?:(?!<\/h\1>)[\s\S])*?Steckbrief(?:(?!<\/h\1>)[\s\S])*?)<\/h\1>\s*<ul[^>]*>([\s\S]*?)<\/ul>/i;
const STRONG_LIST = /<p>\s*<strong>\s*Steckbrief\s*<\/strong>\s*<\/p>\s*<ul[^>]*>([\s\S]*?)<\/ul>/i;

/** Mindestens so viele „Label: Wert“-Zeilen, sonst ist es Fließtext (z. B. Wellensittich). */
const MIN_LABELED_FACTS = 3;

/** Index des ersten Doppelpunkts im Text – Doppelpunkte in Tags (href="https:…") zählen nicht. */
function textColonIndex(html: string) {
  let inTag = false;
  for (let index = 0; index < html.length; index++) {
    const char = html[index];
    if (char === "<") inTag = true;
    else if (char === ">") inTag = false;
    else if (char === ":" && !inTag) return index;
  }
  return -1;
}

function parseFactLine(lineHtml: string): BreedFact | null {
  const cleaned = lineHtml
    .replace(/<img[^>]*>/gi, "")
    .replace(/<\/?(?:strong|b|span)[^>]*>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/^\s*(?:&#8211;|&#8212;|[–—-])\s*/, "")
    .trim();
  if (!stripHtml(cleaned)) return null;

  const colon = textColonIndex(cleaned);
  const rawLabel = colon > -1 ? stripHtml(cleaned.slice(0, colon)) : "";
  // Ein „Label“ mit mehr als vier Wörtern ist ein Satz, kein Steckbrief-Feld.
  if (colon === -1 || !rawLabel || rawLabel.split(/\s+/).length > 4) {
    return { label: "", valueHtml: cleaned, valueText: stripHtml(cleaned) };
  }

  const valueHtml = cleaned.slice(colon + 1).trim();
  return { label: rawLabel, valueHtml, valueText: stripHtml(valueHtml) };
}

function toProfile(html: string, match: RegExpMatchArray, lines: string[]): BreedProfile | null {
  const facts = lines.map(parseFactLine).filter((fact): fact is BreedFact => Boolean(fact));
  if (facts.filter((fact) => fact.label).length < MIN_LABELED_FACTS) return null;

  const start = match.index ?? 0;
  return {
    facts,
    content: html.slice(0, start) + BREED_FACTS_MARKER + html.slice(start + match[0].length),
  };
}

function listItems(listHtml: string) {
  return [...listHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((item) => item[1]);
}

/** Findet den Steckbrief einer Rassenseite; null, wenn die Seite keinen hat. */
export function parseBreedProfile(html: string): BreedProfile | null {
  const strongList = html.match(STRONG_LIST);
  if (strongList) {
    const profile = toProfile(html, strongList, listItems(strongList[1]));
    if (profile) return profile;
  }

  const headingList = html.match(HEADING_LIST);
  if (headingList) {
    const profile = toProfile(html, headingList, listItems(headingList[3]));
    if (profile) return profile;
  }

  const headingParagraph = html.match(HEADING_PARAGRAPH);
  if (headingParagraph) {
    return toProfile(html, headingParagraph, headingParagraph[3].split(/<br\s*\/?>/i));
  }

  return null;
}

const LEAD_HEADING = /^\s*<h2[^>]*>\s*(?:Kurzbeschreibung|Einleitung|Allgemeines?)(?:\s*\/\s*Einleitung)?\s*<\/h2>\s*/i;

/** „Kurzbeschreibung“ & Co. als erste Überschrift sind nur Gliederung – der Absatz darunter wird zum Lead. */
export function stripLeadHeading(html: string) {
  return html.replace(LEAD_HEADING, "");
}

/** Erster Absatz als Klartext – für Hero-Intro und Description statt des WP-Auszugs mit „Kurzbeschreibung …“. */
export function getLeadText(html: string) {
  const paragraph = stripLeadHeading(html).match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return paragraph ? stripHtml(paragraph[1]) : "";
}

type KeyFactRule = { pattern: RegExp; icon: string; label?: string };

// Reihenfolge = Priorität der vier Kennzahlen unter dem Hero.
const KEY_FACT_RULES: KeyFactRule[] = [
  { pattern: /^herkunft/i, icon: "🌍", label: "Herkunft" },
  { pattern: /^lebenserwartung/i, icon: "⏳" },
  { pattern: /^gewicht/i, icon: "⚖️" },
  { pattern: /^(widerristhöhe|schulterhöhe|größe)/i, icon: "📏" },
  { pattern: /^(kosten|preis)/i, icon: "💶", label: "Anschaffung" },
];

const FACT_ICONS: [RegExp, string][] = [
  ...KEY_FACT_RULES.map((rule): [RegExp, string] => [rule.pattern, rule.icon]),
  [/^(name|alternative namen)/i, "🏷️"],
  [/^wissenschaftlich/i, "🔬"],
  [/^charakter|^wesen/i, "💛"],
  [/farbe|fell/i, "🎨"],
  [/^fci/i, "🏅"],
  [/^(eignung|sportart)/i, "🎯"],
];

export function breedFactIcon(label: string) {
  return FACT_ICONS.find(([pattern]) => pattern.test(label))?.[1] ?? "🐾";
}

export type BreedKeyFact = { icon: string; label: string; value: string };

/** Bis zu vier Kennzahlen für die Leiste unter dem Hero (je Regel nur der erste Treffer). */
export function pickKeyFacts(facts: BreedFact[], limit = 4): BreedKeyFact[] {
  const picked: BreedKeyFact[] = [];
  for (const rule of KEY_FACT_RULES) {
    const fact = facts.find((entry) => rule.pattern.test(entry.label) && entry.valueText);
    if (fact) picked.push({ icon: rule.icon, label: rule.label ?? fact.label, value: fact.valueText });
    if (picked.length === limit) break;
  }
  return picked;
}

/** Charakter-Werte („ruhig, zufrieden, genügsam“) als einzelne Eigenschaften. */
export function getBreedTraits(facts: BreedFact[]) {
  const character = facts.find((fact) => /^charakter/i.test(fact.label));
  if (!character) return [] as string[];
  return character.valueText
    .split(/\s*(?:,|;|\bund\b|&)\s*/i)
    .map((trait) => trait.replace(/\.$/, "").trim())
    .filter(Boolean);
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderBreedFactsCard(facts: BreedFact[], breedName: string) {
  const traits = getBreedTraits(facts);
  const items = facts
    .filter((fact) => !(traits.length && /^charakter/i.test(fact.label)))
    .map((fact) =>
      fact.label
        ? `<div class="breed-facts-item"><dt><span class="breed-facts-paw" aria-hidden="true">${breedFactIcon(fact.label)}</span>${escapeHtml(fact.label)}</dt><dd>${fact.valueHtml}</dd></div>`
        : `<div class="breed-facts-item breed-facts-note"><dd>${fact.valueHtml}</dd></div>`,
    )
    .join("");
  const traitRow = traits.length
    ? `<div class="breed-facts-traits"><span class="breed-facts-traits-label">Charakter</span><ul class="breed-trait-list">${traits
        .map((trait) => `<li>${escapeHtml(trait)}</li>`)
        .join("")}</ul></div>`
    : "";

  return [
    '<section class="breed-facts-card" id="steckbrief">',
    '<div class="breed-facts-header">',
    '<span class="eyebrow eyebrow-brand">Steckbrief</span>',
    `<h2>${escapeHtml(breedName)} auf einen Blick</h2>`,
    "</div>",
    traitRow,
    `<dl class="breed-facts-list">${items}</dl>`,
    "</section>",
  ].join("");
}

/** Rassename aus dem Titel: „Windhund Barsoi: Russlands …“ → „Windhund Barsoi“. */
export function getBreedName(title: string) {
  return decodeHtmlEntities(title).split(/\s[–—-]\s|:\s/)[0].trim();
}

export function slugifyHeading(text: string) {
  return (
    stripHtml(text)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "abschnitt"
  );
}

const SKIPPED_SECTIONS = /^(faqs?|steckbrief.*|kurzbeschreibung.*|einleitung|weitere artikel.*)$/i;

/** „Farben und Farbkombinationen bei Britisch Kurzhaar“ → „Farben und Farbkombinationen“ – nur wenn der Rassename folgt. */
export function shortenSectionLabel(label: string, breedName: string) {
  const nameWords = breedName
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length >= 4);
  // Der Rest nach der Präposition muss mit dem Rassenamen beginnen, sonst bleibt das Label ganz
  // („Überlegungen vor der Anschaffung einer Britisch Kurzhaar“ wird nicht zu „Überlegungen vor“).
  const match = label.match(/^(.{6,}?)\s+(?:bei|von|für|der|des)\s+(?:(?:der|dem|den|einer|einem|eines)\s+)?(\S+)/i);
  if (!match || !nameWords.some((word) => match[2].toLowerCase().startsWith(word.slice(0, 5)))) return label;
  return match[1];
}

export function getBreedSectionLinks(html: string, breedName: string): BreedSectionLink[] {
  const links = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map((match) => decodeHtmlEntities(stripHtml(match[1])).replace(/\s*:$/, ""))
    .filter((label) => label && !SKIPPED_SECTIONS.test(label))
    .map((label) => ({ id: slugifyHeading(label), label: shortenSectionLabel(label, breedName) }));

  return links.filter((link, index, all) => all.findIndex((entry) => entry.id === link.id) === index);
}

export function enhanceBreedContent(profile: BreedProfile, breedName: string) {
  let next = stripLeadHeading(profile.content).replace(BREED_FACTS_MARKER, renderBreedFactsCard(profile.facts, breedName));

  next = next.replace(/<p>\s*(<img[\s\S]*?>)\s*<\/p>/gi, '<figure class="breed-inline-media">$1</figure>');
  // Überschriften, die nur ein Bild enthalten (kommt in WP vor), werden zur Bildfigur.
  next = next.replace(/<h2[^>]*>\s*(<img[^>]*>)\s*<\/h2>/gi, '<figure class="breed-inline-media">$1</figure>');
  next = next.replace(/<h2(?![^>]*\b(?:id|class)=)[^>]*>([\s\S]*?)<\/h2>/gi, (_match, headingHtml: string) => {
    const id = slugifyHeading(decodeHtmlEntities(stripHtml(headingHtml)));
    return `<h2 id="${id}" class="breed-section-title">${headingHtml}</h2>`;
  });

  return next;
}
