// node --env-file=../dich-mit-stich/.env.local scripts/ch-magazine-audio.mjs
// Existing files are reused. Credentials never enter the repository.
import fs from 'node:fs';
import path from 'node:path';

const scripts = JSON.parse(fs.readFileSync('docs/ch-magazin-audio.json', 'utf8'));
const voice = process.env.ELEVENLABS_VOICE_ID || 'mDRP1h6KfUD1XAUJxqr0';
const model = process.env.ELEVENLABS_MODEL_ID || 'eleven_v4';
for (const [slug, text] of Object.entries(scripts)) {
  const target = path.join('public/magazin/media/ch', `${slug}-audio.mp3`);
  if (fs.existsSync(target)) { console.log(slug, 'bereits vorhanden'); continue; }
  if (!process.env.ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY fehlt');
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: model, language_code: 'de' }),
  });
  if (!response.ok) throw new Error(`ElevenLabs ${response.status}: ${slug}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!response.headers.get('content-type')?.includes('audio') || bytes.length < 10000) throw new Error(`Ungültige Audiodatei: ${slug}`);
  fs.writeFileSync(target, bytes);
  console.log(slug, model, bytes.length, 'Bytes');
}
