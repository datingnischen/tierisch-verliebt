import type { MagazineCategory, MagazineEntry } from "./wordpress";

// Inhaltsverzeichnis für /magazin/inhalt: alle Beiträge und Seiten, gruppiert.
// WordPress-Seiten sind flach (kein parent) – die Zuordnung zu Hunderassen, Katzenrassen
// usw. kommt aus den Linklisten der Hub-Seiten, deren Linktexte auch die Kurznamen liefern.

export type MagazineIndexLink = {
  label: string;
  href: string;
};

export type MagazineIndexItem = MagazineIndexLink & {
  meta?: string;
  children: MagazineIndexLink[];
};

export type MagazineIndexSection = {
  id: string;
  title: string;
  emoji: string;
  kind: "posts" | "pages";
  href?: string;
  items: MagazineIndexItem[];
};

export const MAGAZINE_INDEX_HUBS = [
  { slug: "hunderassen", id: "hunderassen", title: "Hunderassen", emoji: "🐶" },
  { slug: "katzenrassen", id: "katzenrassen", title: "Katzenrassen", emoji: "🐱" },
  { slug: "kleintiere", id: "kleintiere", title: "Kleintiere & mehr", emoji: "🐹" },
] as const;

const OTHER_PAGES_ID = "weitere-seiten";

export function magazineTopicEmoji(slug: string) {
  if (slug.includes("hund")) return "🐶";
  if (slug.includes("katze")) return "🐱";
  if (slug.includes("vogel") || slug.includes("voegel")) return "🐦";
  if (slug.includes("app")) return "📱";
  if (slug.includes("presse") || slug.includes("sponsor")) return "📰";
  return "🐾";
}

function decode(text: string) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function extractHubLinks(html: string) {
  const links: { slug: string; label: string }[] = [];
  const anchor = /<a\b[^>]*href=(["'])([^"']+)\1[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchor)) {
    const slug = match[2].match(/\/magazin\/([a-z0-9-]+)\/?(?:[?#].*)?$/i)?.[1];
    const label = decode(match[3]);
    if (slug && label) links.push({ slug, label });
  }
  return links;
}

// "Beagle – Das Portrait" → "Beagle"; unklare Titel bleiben vollständig.
export function shortPageTitle(title: string) {
  const cleaned = title
    .replace(/^Portrait zu[r]? (Hunde|Katzen)rasse:?\s*/i, "")
    .replace(/\s*[–-]\s*(das|ein kleines) Portr[aä]it.*$/i, "")
    .replace(/\s+im Portr[aä]it$/i, "")
    .trim();
  return cleaned || title;
}

function byLabel(a: MagazineIndexLink, b: MagazineIndexLink) {
  return a.label.localeCompare(b.label, "de");
}

export function buildMagazineIndex({
  posts,
  pages,
  categories,
  formatDate = (date?: string) => date?.slice(0, 10) ?? "",
}: {
  posts: MagazineEntry[];
  pages: MagazineEntry[];
  categories: MagazineCategory[];
  formatDate?: (date?: string) => string;
}): MagazineIndexSection[] {
  const sections: MagazineIndexSection[] = [];

  // Beiträge nach Hauptkategorie, neueste zuerst.
  const postsByCategory = new Map<string, MagazineEntry[]>();
  for (const post of posts) {
    const slug = post.categories[0]?.slug ?? "allgemein";
    postsByCategory.set(slug, [...(postsByCategory.get(slug) ?? []), post]);
  }
  const orderedCategories = [...categories].sort((a, b) => b.count - a.count);
  for (const [slug] of postsByCategory) {
    if (!orderedCategories.some((category) => category.slug === slug)) {
      orderedCategories.push({ id: 0, name: "Allgemein", slug, description: "", count: 0 });
    }
  }
  for (const category of orderedCategories) {
    const entries = postsByCategory.get(category.slug);
    if (!entries?.length) continue;
    sections.push({
      id: `thema-${category.slug}`,
      title: category.name,
      emoji: magazineTopicEmoji(category.slug),
      kind: "posts",
      href: category.id ? `/magazin/thema/${category.slug}` : undefined,
      items: entries.map((post) => ({
        label: post.title,
        href: `/magazin/${post.slug}`,
        meta: formatDate(post.modified || post.date),
        children: [],
      })),
    });
  }

  // Seiten über die Hub-Linklisten zuordnen.
  const pagesBySlug = new Map(pages.map((page) => [page.slug, page]));
  const assigned = new Set<string>();
  const hubSections: { section: MagazineIndexSection; parents: string[] }[] = [];

  for (const hub of MAGAZINE_INDEX_HUBS) {
    const hubPage = pagesBySlug.get(hub.slug);
    if (!hubPage) continue;
    assigned.add(hub.slug);
    const items: MagazineIndexItem[] = [];
    const parents: string[] = [];
    for (const link of extractHubLinks(hubPage.content)) {
      const page = pagesBySlug.get(link.slug);
      if (!page || assigned.has(page.slug)) continue;
      assigned.add(page.slug);
      parents.push(page.slug);
      items.push({ label: link.label, href: `/magazin/${page.slug}`, children: [] });
    }
    if (!items.length) continue;
    hubSections.push({
      section: { id: hub.id, title: hub.title, emoji: hub.emoji, kind: "pages", href: `/magazin/${hub.slug}`, items },
      parents,
    });
  }

  // Unterseiten wie "maine-coon-pflege" hängen am Rassenporträt "maine-coon".
  for (const page of pages) {
    if (assigned.has(page.slug)) continue;
    for (const { section, parents } of hubSections) {
      const index = parents.findIndex((parent) => page.slug.startsWith(`${parent}-`));
      if (index === -1) continue;
      section.items[index].children.push({ label: page.title, href: `/magazin/${page.slug}` });
      assigned.add(page.slug);
      break;
    }
  }

  for (const { section } of hubSections) {
    section.items.sort(byLabel);
    for (const item of section.items) item.children.sort(byLabel);
    sections.push(section);
  }

  const otherPages = pages
    .filter((page) => !assigned.has(page.slug) || MAGAZINE_INDEX_HUBS.some((hub) => hub.slug === page.slug))
    .map((page) => ({ label: shortPageTitle(page.title), href: `/magazin/${page.slug}`, children: [] }))
    .sort(byLabel);
  if (otherPages.length) {
    sections.push({ id: OTHER_PAGES_ID, title: "Übersichten & weitere Seiten", emoji: "🐾", kind: "pages", items: otherPages });
  }

  return sections;
}

export function countIndexLinks(sections: MagazineIndexSection[]) {
  return sections.reduce(
    (sum, section) => sum + section.items.reduce((inner, item) => inner + 1 + item.children.length, 0),
    0,
  );
}
