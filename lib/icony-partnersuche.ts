import { cache } from "react";
import { SITE_URL, decodeHtmlEntities, stripHtml } from "@/lib/wordpress";

const SOURCE_BASE = "https://tierisch-verliebt.de";
const PARTNERSUCHE_BASE = `${SOURCE_BASE}/partnersuche/`;
const SITEMAP_URL = `${SOURCE_BASE}/sitemap.php`;

type SitemapUrl = {
  loc: string;
};

export type PartnersucheCity = {
  slug: string;
  path: string;
  sourceUrl: string;
  title: string;
  description: string;
  cityName: string;
  lead: string;
  imageUrl?: string;
  imageAlt?: string;
  contentHtml: string;
};

export type PartnersucheHub = {
  title: string;
  description: string;
  cities: Array<{
    slug: string;
    cityName: string;
    href: string;
    imageUrl?: string;
    imageAlt?: string;
  }>;
};

function normalizeSlugToCityName(slug: string) {
  const map: Record<string, string> = {
    koeln: "Köln",
    muenchen: "München",
    duesseldorf: "Düsseldorf",
    nuernberg: "Nürnberg",
    muenster: "Münster",
    "frankfurt-am-main": "Frankfurt am Main",
  };

  if (map[slug]) return map[slug];

  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Amigo tierisch-verliebt partnersuche import",
    },
    next: { revalidate: 3600 },
  } as RequestInit & { next: { revalidate: number } });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function getMetaContent(html: string, name: string) {
  const match = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`, "i"));
  return match?.[1] ? decodeHtmlEntities(match[1]) : "";
}

function getTitle(html: string) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(stripHtml(match[1])) : "";
}

function getH1(html: string) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match?.[1] ? decodeHtmlEntities(stripHtml(match[1])) : "";
}

function extractDivByClass(html: string, classFragment: string) {
  const openTag = new RegExp(`<div[^>]+class=["'][^"']*${classFragment}[^"']*["'][^>]*>`, "i");
  const openMatch = openTag.exec(html);
  if (!openMatch || openMatch.index === undefined) return "";

  let depth = 1;
  let cursor = openMatch.index + openMatch[0].length;
  const tagRegex = /<div\b[^>]*>|<\/div>/gi;
  tagRegex.lastIndex = cursor;

  let next: RegExpExecArray | null;
  while ((next = tagRegex.exec(html))) {
    if (next[0].toLowerCase().startsWith("</div")) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(cursor, next.index).trim();
      }
    } else {
      depth += 1;
    }
  }

  return "";
}

function normalizeImportedHtml(html: string) {
  return html
    .replace(/https:\/\/tierisch-verliebt\.de/gi, "")
    .replace(/http:\/\/tierisch-verliebt\.de/gi, "")
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, "")
    .replace(/\sdata-media-id="[^"]*"/gi, "")
    .trim();
}

function extractFirstImage(html: string) {
  const match = html.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i) || html.match(/<img[^>]+alt="([^"]*)"[^>]*src="([^"]+)"[^>]*>/i);
  if (!match) return {};
  if (match[1]?.startsWith("http")) {
    return { imageUrl: match[1], imageAlt: decodeHtmlEntities(match[2] || "") };
  }
  return { imageUrl: match[2], imageAlt: decodeHtmlEntities(match[1] || "") };
}

function firstParagraphFromHtml(html: string) {
  const match = html.match(/<p>([\s\S]*?)<\/p>/i);
  return match ? decodeHtmlEntities(stripHtml(match[1])) : "";
}

export const getPartnersucheSlugs = cache(async (): Promise<string[]> => {
  const xml = await fetchText(SITEMAP_URL);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1]);

  return urls
    .filter((url) => url.startsWith(PARTNERSUCHE_BASE) && url !== PARTNERSUCHE_BASE)
    .map((url) => url.replace(PARTNERSUCHE_BASE, "").replace(/\/$/, ""))
    .filter(Boolean);
});

export const getPartnersucheHub = cache(async (): Promise<PartnersucheHub> => {
  const html = await fetchText(PARTNERSUCHE_BASE);
  const slugs = await getPartnersucheSlugs();
  const previews = await Promise.all(slugs.map((slug) => getPartnersucheCity(slug)));

  return {
    title: getTitle(html) || "Finde tierliebe Singles aus deiner Region",
    description:
      getMetaContent(html, "description") ||
      "Wähle eine Stadt und entdecke tierliebe Singles, Treffpunkte und hilfreiche Einstiege für deine Partnersuche.",
    cities: slugs.map((slug, index) => ({
      slug,
      cityName: normalizeSlugToCityName(slug),
      href: `/partnersuche/${slug}`,
      imageUrl: previews[index]?.imageUrl,
      imageAlt: previews[index]?.imageAlt,
    })),
  };
});

export const getPartnersucheCity = cache(async (slug: string): Promise<PartnersucheCity | null> => {
  const sourceUrl = `${PARTNERSUCHE_BASE}${slug}/`;
  const html = await fetchText(sourceUrl);

  const title = getH1(html) || getTitle(html);
  if (!title) return null;

  const rawContent = extractDivByClass(html, "text-content");
  const contentHtml = normalizeImportedHtml(rawContent);
  const cityName = normalizeSlugToCityName(slug);
  const description =
    getMetaContent(html, "description") ||
    `Entdecke tierfreundliche Orte, Treffpunkte und Tipps für tierliebe Singles in ${cityName}.`;
  const lead = firstParagraphFromHtml(contentHtml) || description;
  const { imageUrl, imageAlt } = extractFirstImage(contentHtml);

  return {
    slug,
    path: `/partnersuche/${slug}`,
    sourceUrl,
    title,
    description,
    cityName,
    lead,
    imageUrl,
    imageAlt,
    contentHtml,
  };
});

export const getNearbyPartnersucheCities = cache(async (slug: string) => {
  const slugs = await getPartnersucheSlugs();
  const currentIndex = slugs.indexOf(slug);
  const ordered = currentIndex >= 0 ? [...slugs.slice(currentIndex + 1), ...slugs.slice(0, currentIndex)] : slugs;

  return ordered.slice(0, 6).map((entry) => ({
    slug: entry,
    cityName: normalizeSlugToCityName(entry),
    href: `/partnersuche/${entry}`,
  }));
});

export function partnersucheCanonical(path = "/partnersuche") {
  return `${SITE_URL}${path}`;
}
