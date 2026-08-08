import { cache } from "react";
import { ABOUT_SOCIAL_MEDIA_PATH } from "@/lib/about-section";
import { SITE_URL, decodeHtmlEntities, stripHtml } from "@/lib/wordpress";

const SOURCE_URL = "https://tierisch-verliebt.de/social-media/";

export type ImportedStaticPage = {
  title: string;
  description: string;
  lead: string;
  imageUrl?: string;
  imageAlt?: string;
  contentHtml: string;
  sourceUrl: string;
};

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Amigo tierisch-verliebt static import",
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
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(stripHtml(match[1])) : "";
}

function extractPanelAfterH1(html: string) {
  const h1Regex = /<h1[^>]*>[\s\S]*?<\/h1>/i;
  const h1Match = h1Regex.exec(html);
  if (!h1Match) return "";

  const h1Index = h1Match.index;
  const h1EndIndex = h1Index + h1Match[0].length;
  const endMarker = '<div class="ic-row m-t-40">';
  const endIndex = html.indexOf(endMarker, h1EndIndex);
  if (endIndex === -1) return "";

  return html.slice(h1EndIndex, endIndex).trim();
}

function normalizeImportedHtml(html: string) {
  return html
    .replace(/https:\/\/tierisch-verliebt\.de/gi, "")
    .replace(/http:\/\/tierisch-verliebt\.de/gi, "")
    .replace(/<p>\s*&nbsp;\s*<\/p>/gi, "")
    .replace(/\sdata-media-id="[^"]*"/gi, "")
    .replace(/style="float:\s*left;?"/gi, 'class="social-inline-icon"')
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

export const getSocialMediaPage = cache(async (): Promise<ImportedStaticPage> => {
  const html = await fetchText(SOURCE_URL);
  const title = getTitle(html) || "Tierisch-verliebt auf Social Media";
  const rawContent = extractPanelAfterH1(html);
  const contentHtml = normalizeImportedHtml(rawContent);
  const { imageUrl, imageAlt } = extractFirstImage(contentHtml);

  return {
    title,
    description:
      getMetaContent(html, "description") ||
      "Folge tierisch-verliebt auf Social Media und bleib mit der Community rund um Tierliebe, Dating und Haustiere in Kontakt.",
    lead: firstParagraphFromHtml(contentHtml),
    imageUrl,
    imageAlt,
    contentHtml,
    sourceUrl: SOURCE_URL,
  };
});

export function socialMediaCanonical() {
  return `${SITE_URL}${ABOUT_SOCIAL_MEDIA_PATH}`;
}
