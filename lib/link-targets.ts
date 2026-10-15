// Gleicher Linktext soll im ganzen Magazin auf dasselbe Ziel zeigen (Seobility „identische Linktexte, unterschiedliche
// Ziele“, Crawl 14.10.2026). Sichtbarer Text bleibt immer erhalten.

const OWN_ORIGIN = /^https?:\/\/(?:www\.)?tierisch-verliebt\.de/i;
const TEXT_ANCHOR = /<a\b([^>]*?)\bhref="([^"]*)"([^>]*)>([^<]+)<\/a>/gi;

// Themenwörter, die Navigation und Footer bereits verlinken: im Text dasselbe Ziel wie dort.
const PREFERRED: Record<string, string> = {
  hunde: "/magazin/hunderassen",
  hunderassen: "/magazin/hunderassen",
  katzen: "/magazin/beliebtesten-katzenrassen",
  katzenrassen: "/magazin/katzenrassen",
  "beliebteste hunderassen": "/magazin/beliebtesten-hunderassen",
  "beliebteste katzenrassen": "/magazin/beliebtesten-katzenrassen",
  vögel: "/magazin/voegel-uebersicht",
  kleintiere: "/magazin/kleintiere",
  kaninchen: "/magazin/kaninchen",
  meerschweinchen: "/magazin/meerschweinchen",
  magazin: "/magazin",
  partnersuche: "/partnersuche",
  "über uns": "/ueber-uns",
  "unsere geschichte": "/ueber-uns/geschichte",
  bewertungen: "/ueber-uns/bewertungen",
  "social media": "/ueber-uns/social-media",
  "christian m. haas": "/magazin/christian",
};

const keyOf = (text: string) => text.replace(/&nbsp;| /g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim().toLowerCase();

// Interner Pfad ohne Schrägstrich am Ende, Query und Anker; externe Links und Dateien liefern null.
function internalPath(href: string): string | null {
  const local = OWN_ORIGIN.test(href) ? href.replace(OWN_ORIGIN, "") || "/" : href;
  if (!local.startsWith("/") || local.startsWith("//")) return null;
  const path = local.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return /\.[a-z0-9]{2,4}$/i.test(path) ? null : path;
}

const slugOf = (text: string) =>
  text.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Bestimmt je Linktext ein Ziel und passt alle Inhalte an: Themenwörter werden umgeleitet, sonst bleibt das häufigste Ziel verlinkt. */
export function withUniqueLinkTargets<T extends { content: string }>(entries: T[]): T[] {
  const counts = new Map<string, Map<string, number>>();
  for (const entry of entries) {
    for (const match of entry.content.matchAll(TEXT_ANCHOR)) {
      const path = internalPath(match[2]);
      const key = keyOf(match[4]);
      if (!path || !key) continue;
      const targets = counts.get(key) ?? new Map<string, number>();
      targets.set(path, (targets.get(path) ?? 0) + 1);
      counts.set(key, targets);
    }
  }

  const canonical = new Map<string, string>();
  for (const [key, targets] of counts) {
    if (PREFERRED[key]) canonical.set(key, PREFERRED[key]);
    else if (targets.size > 1) {
      const slug = slugOf(key);
      const [best] = [...targets].sort((a, b) => b[1] - a[1] || Number(b[0].endsWith(`/${slug}`)) - Number(a[0].endsWith(`/${slug}`)) || a[0].localeCompare(b[0]));
      canonical.set(key, best[0]);
    }
  }

  return entries.map((entry) => ({
    ...entry,
    content: entry.content.replace(TEXT_ANCHOR, (match, before: string, href: string, after: string, text: string) => {
      const path = internalPath(href);
      const target = canonical.get(keyOf(text));
      if (!path || !target || path === target) return match;
      return PREFERRED[keyOf(text)] ? `<a${before}href="${target === "/" ? "/" : `${target}/`}"${after}>${text}</a>` : text;
    }),
  }));
}
