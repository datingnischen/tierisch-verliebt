import { cache } from "react";

const MAGAZINE_API_BASE = "https://tierisch-verliebt.de/magazin/wp-json/wp/v2";
export const SITE_URL = "https://tierisch-verliebt.vercel.app";
export const MAGAZINE_POSTS_PER_PAGE = 12;

export type WpRendered = {
  rendered?: string;
};

type WpMedia = {
  source_url?: string;
  alt_text?: string;
};

type WpAuthor = {
  name?: string;
  slug?: string;
  link?: string;
};

type WpTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy?: string;
  link?: string;
  description?: string;
};

type WpRestItem = {
  id: number;
  slug: string;
  type: "post" | "page";
  date?: string;
  modified?: string;
  link?: string;
  title?: WpRendered;
  excerpt?: WpRendered;
  content?: WpRendered;
  _embedded?: {
    author?: WpAuthor[];
    "wp:featuredmedia"?: WpMedia[];
    "wp:term"?: WpTerm[][];
  };
};

type WpCategory = {
  id: number;
  count?: number;
  name: string;
  slug: string;
  link?: string;
  description?: string;
};

export type MagazineCategory = {
  id: number;
  name: string;
  slug: string;
  link?: string;
  description: string;
  count: number;
};

export type MagazineEntry = {
  id: number;
  slug: string;
  type: "post" | "page";
  date?: string;
  modified?: string;
  link?: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  authorName?: string;
  authorSlug?: string;
  categories: MagazineCategory[];
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

function normalizeCategory(term: WpTerm): MagazineCategory {
  return {
    id: term.id,
    name: decodeHtmlEntities(term.name || ""),
    slug: term.slug,
    link: term.link,
    description: decodeHtmlEntities(term.description || ""),
    count: 0,
  };
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

function normalizeEntry(item: WpRestItem): MagazineEntry {
  const featured = item._embedded?.["wp:featuredmedia"]?.[0];
  const author = item._embedded?.author?.[0];
  const categoryTerms = (item._embedded?.["wp:term"] || [])
    .flat()
    .filter((term) => term?.taxonomy === "category")
    .map(normalizeCategory);

  return {
    id: item.id,
    slug: item.slug,
    type: item.type,
    date: item.date,
    modified: item.modified,
    link: item.link,
    title: decodeHtmlEntities(item.title?.rendered || ""),
    excerpt: item.excerpt?.rendered || "",
    content: item.content?.rendered || "",
    featuredImage: featured?.source_url,
    featuredImageAlt: featured?.alt_text ? decodeHtmlEntities(featured.alt_text) : undefined,
    authorName: author?.name ? decodeHtmlEntities(author.name) : undefined,
    authorSlug: author?.slug,
    categories: categoryTerms,
  };
}

async function fetchWp<T>(path: string, params: Record<string, string | number | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value));
  }

  const response = await fetch(`${MAGAZINE_API_BASE}${path}?${search.toString()}`, {
    headers: {
      "User-Agent": "Amigo tierisch-verliebt magazine migration",
    },
    next: { revalidate: 300 },
  } as RequestInit & { next: { revalidate: number } });

  if (!response.ok) {
    throw new Error(`WordPress request failed for ${path}: ${response.status} ${response.statusText}`);
  }

  return response as Response & { json(): Promise<T> };
}

async function fetchAllPaginated<T>(
  path: string,
  baseParams: Record<string, string | number | boolean>,
  perPage = 100,
) {
  const results: T[] = [];
  let page = 1;

  while (true) {
    const response = await fetchWp<T[]>(path, { ...baseParams, per_page: perPage, page });
    const batch = await response.json();
    results.push(...batch);

    const totalPages = Number(response.headers.get("X-WP-TotalPages") || page);
    if (page >= totalPages || batch.length === 0) break;
    page += 1;
  }

  return results;
}

export const getMagazineCategories = cache(async (): Promise<MagazineCategory[]> => {
  const response = await fetchAllPaginated<WpCategory>("/categories", {
    orderby: "count",
    order: "desc",
    hide_empty: true,
  });

  return response
    .map((category) => ({
      id: category.id,
      name: decodeHtmlEntities(category.name),
      slug: category.slug,
      link: category.link,
      description: decodeHtmlEntities(category.description || ""),
      count: category.count || 0,
    }))
    .sort((a, b) => b.count - a.count);
});

export const getMagazinePosts = cache(async (): Promise<MagazineEntry[]> => {
  const posts = await fetchAllPaginated<WpRestItem>(
    "/posts",
    {
      _embed: 1,
      orderby: "date",
      order: "desc",
    },
    20,
  );

  return posts.map(normalizeEntry);
});

export const getMagazinePages = cache(async (): Promise<MagazineEntry[]> => {
  const pages = await fetchAllPaginated<WpRestItem>(
    "/pages",
    {
      _embed: 1,
      orderby: "title",
      order: "asc",
    },
    20,
  );

  return pages.map(normalizeEntry);
});

export const getMagazinePostsPage = cache(
  async (page: number, perPage = MAGAZINE_POSTS_PER_PAGE): Promise<{
    posts: MagazineEntry[];
    totalPages: number;
    totalItems: number;
  }> => {
    const response = await fetchWp<WpRestItem[]>("/posts", {
      _embed: 1,
      orderby: "date",
      order: "desc",
      per_page: perPage,
      page,
    });

    const posts = await response.json();
    return {
      posts: posts.map(normalizeEntry),
      totalPages: Number(response.headers.get("X-WP-TotalPages") || 1),
      totalItems: Number(response.headers.get("X-WP-Total") || posts.length),
    };
  },
);

export const getAllMagazineEntries = cache(async (): Promise<MagazineEntry[]> => {
  const [posts, pages] = await Promise.all([getMagazinePosts(), getMagazinePages()]);
  return [...posts, ...pages];
});

export const getMagazineEntryBySlug = cache(async (slug: string): Promise<MagazineEntry | null> => {
  const postResponse = await fetchWp<WpRestItem[]>("/posts", { slug, _embed: 1 });
  const posts = await postResponse.json();
  if (posts[0]) return normalizeEntry(posts[0]);

  const pageResponse = await fetchWp<WpRestItem[]>("/pages", { slug, _embed: 1 });
  const pages = await pageResponse.json();
  if (pages[0]) return normalizeEntry(pages[0]);

  return null;
});

export const getMagazineCategoryBySlug = cache(async (slug: string): Promise<MagazineCategory | null> => {
  const response = await fetchWp<WpCategory[]>("/categories", { slug });
  const categories = await response.json();
  const category = categories[0];
  if (!category) return null;

  return {
    id: category.id,
    name: decodeHtmlEntities(category.name),
    slug: category.slug,
    link: category.link,
    description: decodeHtmlEntities(category.description || ""),
    count: category.count || 0,
  };
});

export const getMagazinePostsByCategory = cache(async (categoryId: number): Promise<MagazineEntry[]> => {
  const posts = await fetchAllPaginated<WpRestItem>(
    "/posts",
    {
      _embed: 1,
      categories: categoryId,
      orderby: "date",
      order: "desc",
    },
    20,
  );

  return posts.map(normalizeEntry);
});
