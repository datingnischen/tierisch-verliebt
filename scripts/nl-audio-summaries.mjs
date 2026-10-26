#!/usr/bin/env node
// Erzeugt die niederländischen Audio-Samenvattingen (ElevenLabs eleven_v4, Stimme Roos) für tierisch-verliebt.nl
// und trägt sie in data/nl-audio.json ein. Sprechtexte: docs/audio-summaries/nl-texte.json { "dating/<stad>": "…" }.
// Aufruf: node --env-file=../dich-mit-stich/.env.local scripts/nl-audio-summaries.mjs
// Vorhandene MP3s in public/audio/nl/ werden nicht neu erzeugt (Credits).
import fs from "node:fs";
import path from "node:path";

const VOICE_ID = "7qdUFMklKPaaAVMsBTBt"; // Roos – Kind, Articulate and Confident (nl-NL), Christians Wahl 2026-10-26
const texts = JSON.parse(fs.readFileSync("docs/audio-summaries/nl-texte.json", "utf8"));
const indexFile = path.join("data", "nl-audio.json");
const index = JSON.parse(fs.readFileSync(indexFile, "utf8"));
fs.mkdirSync(path.join("public", "audio", "nl"), { recursive: true });

for (const [key, text] of Object.entries(texts)) {
  const name = `${key.split("/")[1]}-samenvatting.mp3`;
  const target = path.join("public", "audio", "nl", name);
  if (!fs.existsSync(target)) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: "eleven_v4", language_code: "nl" }),
    });
    if (!response.ok) { console.log(key, "– ElevenLabs", response.status, (await response.text()).slice(0, 160)); continue; }
    fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
    console.log(key, "– MP3 erzeugt");
  }
  index[key] = { src: `/audio/nl/${name}`, seconds: Math.round((fs.statSync(target).size * 8) / 128000), text };
}
fs.writeFileSync(indexFile, `${JSON.stringify(index, null, 2)}\n`);
console.log(Object.keys(index).length, "Einträge in", indexFile);
