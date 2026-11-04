import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const { MAX_PARAGRAPH_WORDS, splitLongParagraphs } = await import("../lib/long-paragraphs.ts");

const sentence = (index) => `Satz ${index} erklärt ruhig und sachlich, worauf du beim ersten Date mit Hund achten kannst.`;
const words = (html) => html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
const paragraphs = (html) => [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((match) => match[1]);

test("paragraphs over the word limit are split at sentence ends (Semrush: Absätze sind zu lang)", () => {
  const long = Array.from({ length: 18 }, (_, index) => sentence(index + 1)).join(" ");
  const parts = paragraphs(splitLongParagraphs(`<p>${long}</p>`));
  assert.ok(words(long) > MAX_PARAGRAPH_WORDS);
  assert.ok(parts.length >= 2);
  for (const part of parts) {
    assert.ok(words(part) <= MAX_PARAGRAPH_WORDS, part);
    assert.match(part, /^Satz \d+ .*\.$/);
  }
  assert.equal(parts.join(" "), long);
});

test("short paragraphs, links and abbreviations stay intact", () => {
  const short = `<p>${sentence(1)}</p>`;
  assert.equal(splitLongParagraphs(short), short);

  const withLink = Array.from({ length: 16 }, (_, index) =>
    index === 7 ? `Mehr dazu im <a href="/magazin/singles-mit-hund/">Ratgeber. Dort steht alles</a> ausführlich.` : sentence(index + 1),
  ).join(" ");
  const parts = paragraphs(splitLongParagraphs(`<p>${withLink}</p>`));
  assert.ok(parts.some((part) => part.includes(`<a href="/magazin/singles-mit-hund/">Ratgeber. Dort steht alles</a>`)));

  const abbreviations = Array.from({ length: 16 }, (_, index) => `Das kostet ca. 10 Euro, z. B. Bar ${index} bzw. Club.`).join(" ");
  for (const part of paragraphs(splitLongParagraphs(`<p>${abbreviations}</p>`))) {
    assert.doesNotMatch(part, /^(10|B\.|Club)/);
  }
});

test("magazine files contain no plain paragraph over the word limit after splitting", async () => {
  const dir = new URL("../content/magazin/", import.meta.url);
  for (const file of (await readdir(dir)).filter((name) => name.endsWith(".md"))) {
    const html = splitLongParagraphs(await readFile(new URL(file, dir), "utf8"));
    for (const paragraph of paragraphs(html)) {
      // Absätze ohne Satzende (z. B. Listen in einem <p>) lassen sich nicht teilen; sie werden nur gemeldet, wenn sie Satzgrenzen haben.
      if (/[.!?] [A-ZÄÖÜ]/.test(paragraph.replace(/<[^>]*>/g, " "))) assert.ok(words(paragraph) <= MAX_PARAGRAPH_WORDS, `${file}: ${words(paragraph)} Wörter`);
    }
  }
});

test("magazine article page splits long paragraphs before rendering", async () => {
  const source = await readFile(new URL("../app/magazin/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(source, /schemaDedupedContent = splitLongParagraphs\(/);
});
