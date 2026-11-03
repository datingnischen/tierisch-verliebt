import assert from "node:assert/strict";
import test from "node:test";
import { enhanceAudioSummary } from "../lib/audio-summary.ts";

const html = [
  "<p><!-- audio-summary:start --></p>",
  "<h2>Artikel kurz anhören</h2>",
  "<p>Die wichtigsten Punkte kurz und verständlich zusammengefasst.</p>",
  '<p><audio controls preload="none"><source src="/magazin/wp-content/uploads/2026/05/a.mp3" type="audio/mpeg">Dein Browser unterstützt das Audio-Element nicht.</audio><br />',
  "<!-- audio-summary:end --></p>",
  "<p>Weiter im Text.</p>",
].join("\n");

test("Audio-Block wird zur Hörkarte ohne h2 im Inhaltsverzeichnis", () => {
  const out = enhanceAudioSummary(html);
  assert.match(out, /<section class="magazine-audio" aria-label="Artikel kurz anhören">/);
  assert.match(out, /<audio class="magazine-audio-player" controls preload="metadata" src="\/magazin\/wp-content\/uploads\/2026\/05\/a\.mp3">/);
  assert.match(out, /<p class="magazine-audio-intro">Die wichtigsten Punkte/);
  assert.doesNotMatch(out, /<h2>Artikel kurz anhören/);
  assert.doesNotMatch(out, /audio-summary:/);
  assert.match(out, /<\/section>\n<p>Weiter im Text\.<\/p>$/);
});

test("Inhalt ohne Audio-Block bleibt unverändert", () => {
  assert.equal(enhanceAudioSummary("<p>Text</p>"), "<p>Text</p>");
});
