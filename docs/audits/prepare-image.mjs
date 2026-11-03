import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

// Formatkonvertierung für den Bildaudit; keine Retusche oder Motivbearbeitung.
const [source, destination] = process.argv.slice(2);
if (!source || !destination) throw new Error("Usage: node docs/audits/prepare-image.mjs source destination");
let quality = 90;
let output;
do {
  output = await sharp(source).resize({ width: 1536, withoutEnlargement: true }).webp({ quality }).toBuffer();
  quality -= 5;
} while (output.length > 350000 && quality >= 65);
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, output);
const { width, height } = await sharp(output).metadata();
console.log(JSON.stringify({ destination, bytes: output.length, width, height }));
