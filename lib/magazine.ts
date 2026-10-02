import { cache } from "react";
import { LIVE_ORIGIN, withTrailingSlash } from "#markets";
import { loadMagazineStore } from "#magazine-store";

/** Öffentliche Seiten-URLs (Canonical, og:url, JSON-LD, Sitemap) zeigen auf die Live-Domain. */
export const SITE_URL = LIVE_ORIGIN;
export const MAGAZINE_POSTS_PER_PAGE = 12;

export type MagazineCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  /** In WordPress/AIOSEO auf noindex gestellt. */
  noindex?: boolean;
};

export type MagazineEntry = {
  id: number;
  slug: string;
  type: "post" | "page";
  date?: string;
  modified?: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  authorName?: string;
  authorSlug?: string;
  categories: MagazineCategory[];
  /** SEO-Titel aus AIOSEO (ohne Marken-Suffix); leer = Seitentitel. */
  seoTitle?: string;
  /** Meta-Description aus AIOSEO; leer = aus Auszug/Inhalt ableiten. */
  description?: string;
  /** In AIOSEO auf noindex gestellt. */
  noindex?: boolean;
};

function decodeNamedEntities(text: string) {
  const entities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    rsquo: "’",
    lsquo: "‘",
    rdquo: "”",
    ldquo: "“",
    hellip: "…",
    auml: "ä",
    ouml: "ö",
    uuml: "ü",
    Auml: "Ä",
    Ouml: "Ö",
    Uuml: "Ü",
    szlig: "ß",
    eacute: "é",
    agrave: "à",
    ecirc: "ê",
    copy: "©",
    reg: "®",
    trade: "™",
  };

  return text.replace(/&([a-zA-Z]+);/g, (_, name: string) => entities[name] ?? `&${name};`);
}

export function decodeHtmlEntities(text = "") {
  return decodeNamedEntities(text)
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([\da-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)));
}

export function stripHtml(text = "") {
  return decodeHtmlEntities(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Viele Beiträge haben kein Beitragsbild, aber Bilder im Inhalt – das erste taugt als Kartenbild.
// Steckbrief-Häkchen (check-icon-16.png) und Emojis sind keine Kartenbilder.
const DECORATIVE_IMAGE = /(?:icon|emoji|smilies)[^"'/]*\.(?:png|gif|svg)|-\d{2}x\d{2}\.|\/s\.w\.org\//i;

export function getEntryCoverImage(entry: Pick<MagazineEntry, "featuredImage" | "content">) {
  if (entry.featuredImage) return entry.featuredImage;
  for (const match of entry.content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)) {
    const width = Number(match[0].match(/\swidth=["']?(\d+)/i)?.[1] || 0);
    if (DECORATIVE_IMAGE.test(match[1]) || (width && width < 120)) continue;
    return decodeHtmlEntities(match[1]);
  }
  return undefined;
}

export function getReadingMinutes(html = "") {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const INTERNAL_CONTENT_LINK =
  /href=(["'])https?:\/\/(?:www\.)?tierisch-verliebt\.de(\/(?:magazin|partnersuche|ueber-uns|social-media)(?:[\/?#][^"']*)?)\1/gi;

// WordPress speichert interne Links absolut; relativ funktionieren sie auf Produktion und auf Vercel-Previews.
// Seitenpfade enden wie überall auf "/", sonst kostet jeder Klick eine 308-Umleitung.
export function relativizeInternalLinks(html = "") {
  return html.replace(INTERNAL_CONTENT_LINK, (match, quote: string, path: string) => {
    if (/\/wp-(?:content|admin|json)\//i.test(path)) return match;
    return `href=${quote}${withTrailingSlash(path)}${quote}`;
  });
}

export function formatGermanDate(dateString?: string) {
  if (!dateString) return "";

  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString.slice(0, 10);
  }
}

// Artikel zeigen ihr Änderungsdatum, feste Seiten (type "page") gar kein Datum.
export function getEntryUpdatedDate(entry: Pick<MagazineEntry, "type" | "date" | "modified">) {
  if (entry.type !== "post") return undefined;
  return entry.modified || entry.date || undefined;
}

export function formatUpdatedDate(entry: Pick<MagazineEntry, "type" | "date" | "modified">) {
  const formatted = formatGermanDate(getEntryUpdatedDate(entry));
  return formatted ? `Aktualisiert am ${formatted}` : "";
}

// Inhalte liegen als Dateien im Repo (content/magazin, data/magazin) – kein Netzwerkzugriff zur Laufzeit.
export const getMagazineCategories = cache(async (): Promise<MagazineCategory[]> => {
  return loadMagazineStore().categories.filter((category) => category.count > 0);
});

export const getMagazinePosts = cache(async (): Promise<MagazineEntry[]> => {
  return loadMagazineStore().posts;
});

export const getMagazinePages = cache(async (): Promise<MagazineEntry[]> => {
  return loadMagazineStore().pages;
});

export const getMagazinePostsPage = cache(
  async (page: number, perPage = MAGAZINE_POSTS_PER_PAGE): Promise<{
    posts: MagazineEntry[];
    totalPages: number;
    totalItems: number;
  }> => {
    const all = loadMagazineStore().posts;
    const start = (Math.max(1, page) - 1) * perPage;
    return {
      posts: all.slice(start, start + perPage),
      totalPages: Math.max(1, Math.ceil(all.length / perPage)),
      totalItems: all.length,
    };
  },
);

export const getAllMagazineEntries = cache(async (): Promise<MagazineEntry[]> => {
  const { posts, pages } = loadMagazineStore();
  return [...posts, ...pages];
});

export const getMagazineEntryBySlug = cache(async (slug: string): Promise<MagazineEntry | null> => {
  const { bySlug } = loadMagazineStore();
  // Der Proxy-Rewrite kodiert Pfade ein zweites Mal; Slugs mit %-Zeichen (z. B. %d0%b5) kommen daher in
  // verschiedenen Kodierungen an. Roh, einfach und zweifach dekodiert nachschlagen.
  let candidate = slug;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const entry = bySlug.get(candidate);
    if (entry) return entry;
    try {
      const decoded = decodeURIComponent(candidate);
      if (decoded === candidate) break;
      candidate = decoded;
    } catch {
      break;
    }
  }
  return null;
});

export const getMagazineCategoryBySlug = cache(async (slug: string): Promise<MagazineCategory | null> => {
  return loadMagazineStore().categories.find((category) => category.slug === slug) ?? null;
});

export const getMagazinePostsByCategory = cache(async (categoryId: number): Promise<MagazineEntry[]> => {
  return loadMagazineStore().posts.filter((post) => post.categories.some((category) => category.id === categoryId));
});
