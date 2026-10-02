// Schreibt data/magazin/bildmasse.json: Pixelmaße der Beitragsbilder des Magazins.
// Der WP-kompatible REST-Endpunkt (lib/wp-rest-compat.ts) liefert sie als media_details; zur Laufzeit liegt
// public/ nicht in der Serverless-Funktion, darum werden die Maße vorab aus den Bilddateien gelesen.
//   node scripts/magazin-bildmasse.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";

export function imageSize(buffer) {
  if (buffer.length > 24 && buffer.readUInt32BE(0) === 0x89504e47) {
    return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
  }
  if (buffer.length > 10 && buffer.toString("latin1", 0, 3) === "GIF") {
    return [buffer.readUInt16LE(6), buffer.readUInt16LE(8)];
  }
  if (buffer.length > 30 && buffer.toString("latin1", 0, 4) === "RIFF" && buffer.toString("latin1", 8, 12) === "WEBP") {
    const kind = buffer.toString("latin1", 12, 16);
    if (kind === "VP8X") return [1 + buffer.readUIntLE(24, 3), 1 + buffer.readUIntLE(27, 3)];
    if (kind === "VP8 ") return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
    if (kind === "VP8L") {
      const bits = buffer.readUInt32LE(21);
      return [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
    }
  }
  if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return [buffer.readUInt16BE(offset + 7), buffer.readUInt16BE(offset + 5)];
      }
      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
  }
  return null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.cwd();
  const dir = join(root, "content", "magazin");
  const sizes = {};
  for (const name of readdirSync(dir).filter((file) => file.endsWith(".md") && !file.startsWith("_")).sort()) {
    const { data } = matter(readFileSync(join(dir, name), "utf8"));
    if (data.type === "page" || data.draft === true || !data.image || sizes[data.image]) continue;
    const size = imageSize(readFileSync(join(root, "public", data.image)));
    if (!size) throw new Error(`Bildmaße nicht lesbar: ${data.image}`);
    sizes[data.image] = size;
  }
  writeFileSync(join(root, "data", "magazin", "bildmasse.json"), `${JSON.stringify(sizes, null, 2)}\n`);
  console.log(`${Object.keys(sizes).length} Bilder`);
}
