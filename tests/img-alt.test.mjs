import assert from "node:assert/strict";
import test from "node:test";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

async function sourceFiles(dir) {
  const entries = await readdir(join(ROOT, dir), { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return entry.name.endsWith(".tsx") ? [path] : [];
    }),
  );
  return files.flat();
}

// Audit-Tools werten fehlende und leere Alt-Texte gleich als Fehler – auch bei dekorativen Bildern.
test("every <img> in app and components has a non-empty alt text", async () => {
  const problems = [];
  for (const file of [...(await sourceFiles("app")), ...(await sourceFiles("components"))]) {
    const source = await readFile(join(ROOT, file), "utf8");
    for (const match of source.matchAll(/<img\b[\s\S]*?\/?>/g)) {
      const tag = match[0];
      if (!/\balt=/.test(tag)) problems.push(`${file}: <img> ohne alt`);
      else if (/\balt=(""|''|\{""\}|\{''\})/.test(tag)) problems.push(`${file}: leeres alt`);
    }
  }
  assert.deepEqual(problems, []);
});
