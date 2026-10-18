import assert from "node:assert/strict";
import test from "node:test";
import { access, readFile } from "node:fs/promises";

// Über-uns-Seiten „Bewertungen“ und „Social Media“ kommen aus Dateien im Repo. Vorher holte die App die Texte beim
// Rendern von der ICONY-Plattform; als ICONY /bewertungen-und-erfahrungen/ löschte (404, Oktober 2026), antworteten
// /ueber-uns/ und /ueber-uns/bewertungen/ mit 500 (live hinter nginx: 502).

const repoRoot = new URL("../", import.meta.url);
// Git checkt auf Windows mit CRLF aus; die Prüfungen arbeiten mit LF.
const readRepoFile = (relativePath) =>
  readFile(new URL(relativePath, repoRoot), "utf8").then((text) => text.replace(/\r\n/g, "\n"));
const exists = (relativePath) => access(new URL(relativePath, repoRoot)).then(() => true, () => false);

function frontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(match, "Frontmatter fehlt");
  const data = Object.fromEntries(
    match[1].split("\n").map((line) => {
      const [key, ...rest] = line.split(":");
      return [key.trim(), rest.join(":").trim().replace(/^"|"$/g, "")];
    }),
  );
  return { data, body: match[2].trim() };
}

test("about pages are read from files, never fetched from ICONY at runtime", async () => {
  const loader = await readRepoFile("lib/about-pages.ts");
  assert.doesNotMatch(loader, /\bfetch\(/);
  assert.doesNotMatch(loader, /https?:\/\/tierisch-verliebt\.de\/(bewertungen-und-erfahrungen|social-media)/);
  assert.match(loader, /content", "ueber-uns"/);
  assert.equal(await exists("lib/icony-static-pages.ts"), false);
  for (const page of ["app/ueber-uns/page.tsx", "app/ueber-uns/bewertungen/page.tsx", "app/ueber-uns/social-media/page.tsx"]) {
    assert.match(await readRepoFile(page), /from "@\/lib\/about-pages"/, page);
  }
  // Serverless-Funktionen brauchen die Dateien im Bundle.
  assert.match(await readRepoFile("next.config.ts"), /"\.\/content\/ueber-uns\/\*\.md"/);
});

for (const slug of ["bewertungen", "social-media"]) {
  test(`content/ueber-uns/${slug}.md is complete and self-hosted`, async () => {
    const { data, body } = frontmatter(await readRepoFile(`content/ueber-uns/${slug}.md`));
    for (const key of ["title", "description", "image", "imageAlt", "source"]) assert.ok(data[key], `${key} fehlt`);
    assert.ok(data.image.startsWith("/ueber-uns/"));
    assert.ok(await exists(`public${data.image}`), `${data.image} fehlt in public/`);
    assert.ok(body.length > 200, "Inhalt leer");
    assert.doesNotMatch(body, /icony-hosting\.de/, "ICONY-CMS-Bilder sind nicht dauerhaft");
    assert.doesNotMatch(body, /data-media-id|&nbsp;/);
    for (const img of body.match(/<img\b[^>]*>/g) || []) {
      const src = img.match(/src="([^"]+)"/)?.[1];
      assert.ok(src?.startsWith("/ueber-uns/"), img);
      assert.ok(await exists(`public${src}`), `${src} fehlt in public/`);
      assert.match(img, /alt="[^"]+"/, `alt fehlt: ${img}`);
    }
  });
}

test("reviews page keeps the Trustpilot and comparison-portal references", async () => {
  const { body } = frontmatter(await readRepoFile("content/ueber-uns/bewertungen.md"));
  assert.match(body, /trustpilot\.com\/review\/tierisch-verliebt\.de/);
  assert.match(body, /singleboersen-ueberblick\.de\/partnersuche\/tierisch-verliebt\//);
  assert.match(body, /singleboersen-vergleichen\.de\/singleportal\/tierisch-verliebt-de\//);
  assert.match(body, /<h2>Top-Bewertungen auf Trustpilot<\/h2>/);
});
