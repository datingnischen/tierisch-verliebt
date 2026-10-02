import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { assetBaseUrl } from "#static-asset";
import type { MagazineCategory, MagazineEntry } from "#magazine";

/**
 * Magazin-Inhalte aus Dateien (kein WordPress, kein Netzwerk):
 *   content/magazin/<slug>.md      Frontmatter + Inhalt als HTML
 *   data/magazin/kategorien.json   Kategorien
 *   data/magazin/autoren.json      Autoren
 * Medien liegen unter public/magazin/wp-content/uploads/ (URLs wie bisher) und werden über den Asset-Host
 * ausgeliefert (staticAsset-Muster, siehe lib/static-asset.ts).
 */
const CONTENT_DIR = path.join(process.cwd(), "content", "magazin");
const DATA_DIR = path.join(process.cwd(), "data", "magazin");
const UPLOADS = "/magazin/wp-content/uploads/";

type AuthorRecord = { id: number; name: string; slug: string };

type MagazineStore = {
  posts: MagazineEntry[];
  pages: MagazineEntry[];
  categories: MagazineCategory[];
  bySlug: Map<string, MagazineEntry>;
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8")) as T;
}

/** Medien-Pfade im Inhalt sind relativ gespeichert; ausgeliefert werden sie vom Asset-Host. */
function withAssetHost(html: string) {
  return html.replace(/(?<=["'\s,(])\/magazin\/wp-content\/uploads\//g, `${assetBaseUrl}${UPLOADS}`);
}

function asset(pathname?: string) {
  return pathname ? `${assetBaseUrl}${pathname}` : undefined;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function build(): MagazineStore {
  const categoryRecords = readJson<Array<{ id: number; name: string; slug: string; description: string; noindex?: boolean }>>(
    "kategorien.json",
  );
  const authors = new Map(readJson<AuthorRecord[]>("autoren.json").map((author) => [author.slug, author]));
  const categories: MagazineCategory[] = categoryRecords.map((record) => ({
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    count: 0,
    noindex: record.noindex || undefined,
  }));
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

  const entries: MagazineEntry[] = [];
  for (const file of fs.readdirSync(CONTENT_DIR)) {
    if (!file.endsWith(".md") || file.startsWith("_")) continue;
    const parsed = matter(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));
    const data = parsed.data as Record<string, unknown>;
    if (data.draft === true) continue;
    const author = typeof data.author === "string" ? authors.get(data.author) : undefined;
    const entryCategories = (Array.isArray(data.categories) ? (data.categories as string[]) : [])
      .map((slug) => categoryBySlug.get(slug))
      .filter((category): category is MagazineCategory => Boolean(category));
    const type = data.type === "page" ? "page" : "post";
    if (type === "post") for (const category of entryCategories) category.count += 1;

    entries.push({
      id: Number(data.wpId) || 0,
      slug: String(data.slug),
      type,
      date: data.published ? String(data.published) : undefined,
      modified: data.updated ? String(data.updated) : undefined,
      title: String(data.title),
      excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
      content: withAssetHost(parsed.content.trim()),
      featuredImage: asset(typeof data.image === "string" ? data.image : undefined),
      featuredImageAlt: typeof data.imageAlt === "string" && data.imageAlt ? data.imageAlt : undefined,
      authorName: author?.name,
      authorSlug: author?.slug,
      categories: entryCategories,
      seoTitle: typeof data.seoTitle === "string" && data.seoTitle ? data.seoTitle : undefined,
      description: typeof data.description === "string" && data.description ? data.description : undefined,
      noindex: data.noindex === true || undefined,
    });
  }

  const byDateDesc = (a: MagazineEntry, b: MagazineEntry) => (b.date || "").localeCompare(a.date || "");
  const posts = entries.filter((entry) => entry.type === "post").sort(byDateDesc);
  const pages = entries
    .filter((entry) => entry.type === "page")
    .sort((a, b) => a.title.localeCompare(b.title, "de"));

  const bySlug = new Map<string, MagazineEntry>();
  // Beiträge gehen vor Seiten (wie die frühere Abfrage). Slugs mit Prozent-Kodierung sind auch dekodiert auffindbar.
  for (const entry of [...pages, ...posts]) {
    bySlug.set(entry.slug, entry);
    bySlug.set(safeDecode(entry.slug), entry);
  }
  return { posts, pages, categories, bySlug };
}

let cached: MagazineStore | undefined;

export function loadMagazineStore(): MagazineStore {
  if (process.env.NODE_ENV === "production") {
    cached ??= build();
    return cached;
  }
  return build();
}
