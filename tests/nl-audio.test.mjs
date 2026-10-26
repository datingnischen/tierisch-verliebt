import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import audio from "../data/nl-audio.json" with { type: "json" };

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("every Dutch audio summary points to an existing MP3 and stays speakable", () => {
  assert.ok(Object.keys(audio).length > 0);
  for (const [key, entry] of Object.entries(audio)) {
    assert.match(key, /^(dating|magazine)\/[a-z0-9-]+$/);
    const file = new URL(`../public${entry.src}`, import.meta.url);
    assert.ok(existsSync(file) && statSync(file).size > 100_000, `${key}: MP3 fehlt`);
    const words = entry.text.split(/\s+/).length;
    assert.ok(words >= 100 && words <= 170, `${key}: ${words} Wörter`);
    assert.doesNotMatch(entry.text, /[0-9%()/]|https?:|tierisch-verliebt/, `${key}: nicht sprechbar oder mit Plattformnamen`);
  }
});

test("audio summary is rendered on Dutch city and breed pages with transcript and voice note", async () => {
  const [city, magazine, component] = await Promise.all([read("components/nl/city-page.tsx"), read("components/nl/magazine.tsx"), read("components/nl/audio-summary.tsx")]);
  assert.match(city, /getNlAudio\(`dating\/\$\{city\.slug\}`\)/);
  assert.match(magazine, /getNlAudio\(`magazine\/\$\{entry\.slug\}`\)/);
  assert.match(component, /synthetische stem/);
  assert.match(component, /<summary>Lees de transcriptie<\/summary>/);
});
