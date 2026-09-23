import { decodeHtmlEntities, stripHtml } from "#wordpress";

export type HubLink = { slug: string; label: string };

export type HubSplit = {
  before: string;
  after: string;
  links: HubLink[];
};

export type HubTileFacts = {
  origin?: string;
  weight?: string;
  lifespan?: string;
};

// Übersichtsseiten wie "Katzenrassen" bestehen im Kern aus einer langen Linkliste auf Magazin-Porträts.
const MIN_HUB_LINKS = 6;
const HUB_LINK_ITEM =
  /<li[^>]*>\s*<a[^>]+href=["'](?:https?:\/\/(?:www\.)?tierisch-verliebt\.de)?\/magazin\/([a-z0-9-]+)\/?["'][^>]*>([\s\S]*?)<\/a>\s*<\/li>/gi;
const LIST_GLUE = /^(?:\s|<\/?(?:ol|ul|li)\b[^>]*>)*$/i;
const LEADING_LIST_TAGS = /(?:\s|<(?:ol|ul|li)\b[^>]*>)*$/i;
const TRAILING_HEADING = /\s*<h([2-4])[^>]*>(?:(?!<\/?(?:h\d|p|ul|ol|div)\b)[\s\S])*<\/h\1>\s*$/i;
const TRAILING_LIST_TAGS = /^(?:\s|<\/(?:ol|ul|li)>)*/i;

export function splitHubLinkList(html: string): HubSplit | null {
  const items = [...html.matchAll(HUB_LINK_ITEM)];
  if (items.length < MIN_HUB_LINKS) return null;

  // Längste zusammenhängende Folge von Link-Einträgen, nur durch Listen-Tags getrennt.
  let bestStart = 0;
  let bestEnd = 0;
  let runStart = 0;
  for (let index = 1; index <= items.length; index += 1) {
    const previous = items[index - 1];
    const current = items[index];
    const glued =
      current && LIST_GLUE.test(html.slice(previous.index! + previous[0].length, current.index!));
    if (glued) continue;
    if (index - runStart > bestEnd - bestStart) {
      bestStart = runStart;
      bestEnd = index;
    }
    runStart = index;
  }
  if (bestEnd - bestStart < MIN_HUB_LINKS) return null;

  const first = items[bestStart];
  const last = items[bestEnd - 1];
  const head = html.slice(0, first.index!);
  const tail = html.slice(last.index! + last[0].length);
  // Die alte Listenüberschrift ("Steckbriefe unserer Katzenrassen:") ersetzt der Grid-Header.
  const before = head.replace(LEADING_LIST_TAGS, "").replace(TRAILING_HEADING, "");
  const after = tail.replace(TRAILING_LIST_TAGS, "");

  const seen = new Set<string>();
  const links = items
    .slice(bestStart, bestEnd)
    .map((match) => ({ slug: match[1], label: decodeHtmlEntities(stripHtml(match[2])) }))
    .filter((link) => link.label && !seen.has(link.slug) && seen.add(link.slug));

  return { before, after, links };
}

function readSteckbriefValue(html: string, label: string) {
  const pattern = new RegExp(`<strong>\\s*${label}\\s*</strong>\\s*:?\\s*([^<]*)`, "i");
  const value = html.match(pattern)?.[1];
  if (!value) return undefined;
  // Einige alte Beiträge haben kaputte Zeichen (�) statt Gedankenstrich oder Umlaut.
  const clean = decodeHtmlEntities(value)
    .replace(/^\s*:\s*/, "")
    .replace(/\s*�\s*/g, " – ")
    .replace(/\s+/g, " ")
    .trim();
  return clean && clean.length <= 48 && !clean.includes(" – –") ? clean : undefined;
}

export function getHubTileFacts(html: string): HubTileFacts {
  return {
    origin: readSteckbriefValue(html, "Herkunft"),
    weight: readSteckbriefValue(html, "Gewicht"),
    lifespan: readSteckbriefValue(html, "Lebenserwartung"),
  };
}

export function getHubTileTeaser(excerptHtml: string, maxLength = 120) {
  const text = stripHtml(excerptHtml).replace(/\s*(?:\[…\]|\[&hellip;\]|…)\s*$/, "");
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:–-]$/, "")} …`;
}

export function getHubLetter(label: string) {
  const letter = label.trim().charAt(0).toUpperCase().normalize("NFD").charAt(0);
  return /[A-Z]/.test(letter) ? letter : "#";
}
