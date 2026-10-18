import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { decodeHtmlEntities, stripHtml } from "@/lib/magazine";
import { assetBaseUrl } from "@/lib/static-asset";

/**
 * Über-uns-Seiten „Bewertungen“ und „Social Media“ aus Dateien (kein Netzwerk zur Laufzeit):
 *   content/ueber-uns/<slug>.md   Frontmatter (title, description, image, imageAlt, source) + Inhalt als HTML
 *   public/ueber-uns/             Bilder, ausgeliefert über den Asset-Host (lib/static-asset.ts)
 * Bis Oktober 2026 wurden die Texte beim Rendern von der ICONY-Plattform geholt. Als ICONY
 * /bewertungen-und-erfahrungen/ löschte (404), fielen /ueber-uns/ und /ueber-uns/bewertungen/ mit 500 aus.
 */
const CONTENT_DIR = path.join(process.cwd(), "content", "ueber-uns");

export type AboutStaticPage = {
  title: string;
  description: string;
  lead: string;
  imageUrl?: string;
  imageAlt?: string;
  contentHtml: string;
  sourceUrl: string;
};

function asset(pathname?: string) {
  return pathname ? `${assetBaseUrl}${pathname}` : undefined;
}

/** Bildpfade im Inhalt sind relativ gespeichert (/ueber-uns/…); ausgeliefert werden sie vom Asset-Host. */
function withAssetHost(html: string) {
  return html.replace(/(?<=src=")\/ueber-uns\//g, `${assetBaseUrl}/ueber-uns/`);
}

function firstParagraph(html: string) {
  const match = html.match(/<p>([\s\S]*?)<\/p>/i);
  return match ? decodeHtmlEntities(stripHtml(match[1])).replace(/\s+/g, " ").trim() : "";
}

function text(data: Record<string, unknown>, key: string) {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readAboutPage(slug: string): AboutStaticPage {
  const parsed = matter(fs.readFileSync(path.join(CONTENT_DIR, `${slug}.md`), "utf8"));
  const data = parsed.data as Record<string, unknown>;
  const title = text(data, "title");
  const description = text(data, "description");
  if (!title || !description) {
    throw new Error(`content/ueber-uns/${slug}.md braucht title und description im Frontmatter`);
  }
  const contentHtml = withAssetHost(parsed.content.trim());
  return {
    title,
    description,
    lead: firstParagraph(contentHtml),
    imageUrl: asset(text(data, "image")),
    imageAlt: text(data, "imageAlt"),
    contentHtml,
    sourceUrl: text(data, "source") || "",
  };
}

export const getReviewsPage = cache(async (): Promise<AboutStaticPage> => readAboutPage("bewertungen"));

export const getSocialMediaPage = cache(async (): Promise<AboutStaticPage> => readAboutPage("social-media"));
