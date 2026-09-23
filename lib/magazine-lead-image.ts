import { decodeHtmlEntities } from "#wordpress";

export type LeadImage = { src: string; alt: string };

// Absatz oder Figure, der nur aus einem (ggf. verlinkten) Bild besteht – ganz am Anfang des Inhalts.
const LEADING_IMAGE_BLOCK =
  /^\s*<(p|figure)\b[^>]*>\s*(?:<a\b[^>]*>\s*)?(<img\b[^>]*>)\s*(?:<\/a>\s*)?(?:<figcaption\b[\s\S]*?<\/figcaption>\s*)?<\/\1>/i;

/**
 * Manche Beiträge (z. B. unter „Apps") haben kein Beitragsbild, sondern beginnen mit einem Bild im Text.
 * Dieses Bild wird zum Artikelbild oben und verschwindet aus dem Fließtext, damit es nicht doppelt steht.
 */
export function extractLeadImage(html: string): { image: LeadImage; content: string } | null {
  const match = html.match(LEADING_IMAGE_BLOCK);
  if (!match) return null;
  const src = match[2].match(/\ssrc=["']([^"']+)["']/i)?.[1];
  if (!src) return null;
  const alt = match[2].match(/\salt=["']([^"']*)["']/i)?.[1] || "";
  return {
    image: { src: decodeHtmlEntities(src), alt: decodeHtmlEntities(alt) },
    content: html.slice(match[0].length),
  };
}
