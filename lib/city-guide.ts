import type { MarketCode } from "./markets.ts";

/**
 * Zerlegt den importierten ICONY-Stadttext in Kapitel, ohne ein Wort zu ändern:
 * leere Absätze, das doppelte Titelbild, die Bildquelle und die Linkliste
 * „Diese Städte könnten auch interessant …“ werden herausgelöst und separat gestaltet.
 */

export type GuideTopic = "walk" | "food" | "stay" | "cat" | "vet" | "groom" | "school" | "trip" | "love" | "paw";

export type GuideSection = {
  id: string;
  heading: string;
  topic: GuideTopic;
  html: string;
};

export type RelatedCityLink = { name: string; path: string };

export type CityGuide = {
  introHtml: string;
  sections: GuideSection[];
  related: RelatedCityLink[];
  imageCreditUrl: string | null;
  tipCount: number;
  readingMinutes: number;
  topics: GuideTopic[];
  animals: GuideAnimal[];
};

export type GuideAnimal = "hund" | "katze" | "pferd" | "kleintier" | "vogel";

const TOPIC_RULES: [GuideTopic, RegExp][] = [
  ["cat", /katze|katz\b|samtpfote/],
  ["groom", /friseur|fris[öo]r|frisur|salon|groomer|coiffeur|gestylt/],
  ["school", /schule|trainer|erziehung/],
  ["vet", /tierarzt|tierärzt|klinik|dienstleist|service|versorg|anlaufstell|dienste|zahn zwickt/],
  ["stay", /hotel|pension|übernacht|unterbring|urlaub|berggasth/],
  ["food", /café|cafe|restaurant|restaurand|lokal|gastronom|essen gehen|bistro|einkehr|genuss|terrasse|kulinar/],
  ["walk", /gassi|route|spazier|park|wiese|wald|freilauf|auslauf|rhein|aare|see\b|forst|natur|wander|promenade|hundeplatz|hundepl|gehege|weg\b|bergmannsweg|pfänder|treffpunkt/],
  ["trip", /ausfl|sightseeing|zoo|tierpark|allee|hafen|garten|abend|flanier|entdeck|kaiserwerth|kö/],
  ["love", /fazit|single|verlieb|herz|date|flirt|gemeinsam|partner|glück|lieb/],
];

export const TOPIC_LABELS: Record<GuideTopic, string> = {
  walk: "Gassirunden",
  food: "Einkehren mit Tier",
  stay: "Übernachten mit Tier",
  cat: "Für Katzenfreunde",
  vet: "Tierservice",
  groom: "Fellpflege",
  school: "Hundeschulen",
  trip: "Ausflüge",
  love: "Tierliebe & Dating",
  paw: "Tierisch unterwegs",
};

const ANIMAL_RULES: [GuideAnimal, RegExp, number][] = [
  ["hund", /hund|vierbeiner|gassi|welpe/g, 2],
  ["katze", /katze|katzen|samtpfote|kater/g, 1],
  ["pferd", /pferd|reit(?:en|stall|hof)/g, 1],
  ["kleintier", /kaninchen|meerschwein|nager|hamster/g, 1],
  ["vogel", /vögel|vogel|wellensittich|papagei/g, 1],
];

export const ANIMAL_LABELS: Record<GuideAnimal, string> = {
  hund: "Hund",
  katze: "Katze",
  pferd: "Pferd",
  kleintier: "Kleintiere",
  vogel: "Vögel",
};

const EMPTY_PARAGRAPH = /<p>(?:\s|&nbsp;| |<br\s*\/?>)*<\/p>/gi;
const CREDIT = /(?:<hr\s*\/?>\s*)?<p>\s*<small>\s*Bildquelle:?\s*([^<\s]+)\s*<\/small>\s*<\/p>/i;
const HEADING = (level: 2 | 3) => new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)</h${level}>`, "gi");
const RELATED_HEADING = /könnten auch interessant/i;

export function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;| /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function topicFor(heading: string): GuideTopic {
  const value = heading.toLowerCase();
  return TOPIC_RULES.find(([, rule]) => rule.test(value))?.[0] ?? "paw";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function stripHeroImage(html: string, imageUrl?: string | null): string {
  if (!imageUrl) return html;
  const escaped = imageUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(new RegExp(`<img\\b[^>]*src="${escaped}"[^>]*>`, "i"), "");
}

function relatedLinks(html: string, market: MarketCode): RelatedCityLink[] {
  const links: RelatedCityLink[] = [];
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = new URL(match[1], `https://tierisch-verliebt.${market}`);
      if (!/(^|\.)tierisch-verliebt\.(de|at|ch)$/.test(url.hostname)) continue;
      const path = url.pathname.replace(/\/+$/, "");
      const name = plainText(match[2]);
      if (path.startsWith("/partnersuche/") && name) links.push({ name, path });
    } catch {
      // ungültige URL im Altbestand: auslassen
    }
  }
  return links;
}

function countAnimals(text: string): GuideAnimal[] {
  const value = text.toLowerCase();
  return ANIMAL_RULES.filter(([, rule, min]) => (value.match(rule)?.length ?? 0) >= min).map(([animal]) => animal);
}

export function buildCityGuide(input: { market: MarketCode; path?: string; contentHtml: string; imageUrl?: string | null; sourceAttributionUrl?: string | null }): CityGuide {
  let html = stripHeroImage(input.contentHtml, input.imageUrl);
  const credit = html.match(CREDIT);
  html = html.replace(CREDIT, "").replace(EMPTY_PARAGRAPH, "").replace(/<hr\s*\/?>\s*$/i, "").trim();

  const parts: { heading: string | null; html: string }[] = [{ heading: null, html: "" }];
  let cursor = 0;
  // Manche Texte (z. B. Innsbruck) gliedern nur mit h3: dann wird dort geteilt
  const hasH2 = [...html.matchAll(HEADING(2))].some((match) => plainText(match[1]));
  for (const match of html.matchAll(HEADING(hasH2 ? 2 : 3))) {
    parts[parts.length - 1].html += html.slice(cursor, match.index);
    cursor = (match.index ?? 0) + match[0].length;
    const inner = match[1];
    if (plainText(inner)) {
      parts.push({ heading: inner, html: "" });
    } else if (/<img\b/i.test(inner)) {
      // Überschrift ohne Text, nur mit Bild: Bild gehört zum laufenden Abschnitt
      parts[parts.length - 1].html += `<p>${inner}</p>`;
    }
  }
  parts[parts.length - 1].html += html.slice(cursor);

  let related: RelatedCityLink[] = [];
  const sections: GuideSection[] = [];
  const usedIds = new Set<string>();
  for (const part of parts.slice(1)) {
    const heading = plainText(part.heading ?? "");
    if (RELATED_HEADING.test(heading)) {
      related = relatedLinks(part.html, input.market).filter((link) => link.path !== input.path);
      continue;
    }
    let id = slugify(heading) || `abschnitt-${sections.length + 1}`;
    while (usedIds.has(id)) id = `${id}-${sections.length + 1}`;
    usedIds.add(id);
    sections.push({ id, heading, topic: topicFor(heading), html: part.html.trim() });
  }

  const introHtml = parts[0].html.trim();
  const fullText = plainText(introHtml + sections.map((section) => `${section.heading} ${section.html}`).join(" "));
  const tipCount = sections.reduce((sum, section) => sum + (section.html.match(/<li\b/gi)?.length ?? 0), 0)
    + (introHtml.match(/<li\b/gi)?.length ?? 0);
  const topics = [...new Set(sections.map((section) => section.topic))].filter((topic) => topic !== "paw" && topic !== "love");

  return {
    introHtml,
    sections,
    related,
    imageCreditUrl: credit?.[1] ?? input.sourceAttributionUrl ?? null,
    tipCount,
    readingMinutes: Math.max(1, Math.round(fullText.split(" ").length / 200)),
    topics,
    animals: countAnimals(fullText),
  };
}

/* ---------- Geografie: nur für Entfernungen und Regionsangabe ---------- */

type Geo = { lat: number; lon: number; region: string };

const GEO: Record<MarketCode, Record<string, Geo>> = {
  de: {
    berlin: { lat: 52.52, lon: 13.405, region: "Berlin" },
    duesseldorf: { lat: 51.2277, lon: 6.7735, region: "Nordrhein-Westfalen" },
    stuttgart: { lat: 48.7758, lon: 9.1829, region: "Baden-Württemberg" },
    koeln: { lat: 50.9375, lon: 6.9603, region: "Nordrhein-Westfalen" },
    muenchen: { lat: 48.1351, lon: 11.582, region: "Bayern" },
    hamburg: { lat: 53.5511, lon: 9.9937, region: "Hamburg" },
    dortmund: { lat: 51.5136, lon: 7.4653, region: "Nordrhein-Westfalen" },
    essen: { lat: 51.4556, lon: 7.0116, region: "Nordrhein-Westfalen" },
    leipzig: { lat: 51.3397, lon: 12.3731, region: "Sachsen" },
    "frankfurt-am-main": { lat: 50.1109, lon: 8.6821, region: "Hessen" },
    bremen: { lat: 53.0793, lon: 8.8017, region: "Bremen" },
    dresden: { lat: 51.0504, lon: 13.7373, region: "Sachsen" },
    hannover: { lat: 52.3759, lon: 9.732, region: "Niedersachsen" },
    nuernberg: { lat: 49.4521, lon: 11.0767, region: "Bayern" },
    duisburg: { lat: 51.4344, lon: 6.7623, region: "Nordrhein-Westfalen" },
    bochum: { lat: 51.4818, lon: 7.2162, region: "Nordrhein-Westfalen" },
    wuppertal: { lat: 51.2562, lon: 7.1508, region: "Nordrhein-Westfalen" },
    bielefeld: { lat: 52.0302, lon: 8.5325, region: "Nordrhein-Westfalen" },
    bonn: { lat: 50.7374, lon: 7.0982, region: "Nordrhein-Westfalen" },
    muenster: { lat: 51.9607, lon: 7.6261, region: "Nordrhein-Westfalen" },
  },
  at: {
    graz: { lat: 47.0707, lon: 15.4395, region: "Steiermark" },
    innsbruck: { lat: 47.2692, lon: 11.4041, region: "Tirol" },
    salzburg: { lat: 47.8095, lon: 13.055, region: "Salzburg" },
    klagenfurt: { lat: 46.6247, lon: 14.3053, region: "Kärnten" },
    dornbirn: { lat: 47.4125, lon: 9.7417, region: "Vorarlberg" },
    amstetten: { lat: 48.1229, lon: 14.8721, region: "Niederösterreich" },
    steyr: { lat: 48.0427, lon: 14.4213, region: "Oberösterreich" },
    wien: { lat: 48.2082, lon: 16.3738, region: "Wien" },
    linz: { lat: 48.3069, lon: 14.2858, region: "Oberösterreich" },
    "st-poelten": { lat: 48.2047, lon: 15.6256, region: "Niederösterreich" },
    wels: { lat: 48.1575, lon: 14.0289, region: "Oberösterreich" },
    villach: { lat: 46.6103, lon: 13.8558, region: "Kärnten" },
    bregenz: { lat: 47.5031, lon: 9.7471, region: "Vorarlberg" },
    leoben: { lat: 47.3765, lon: 15.0914, region: "Steiermark" },
    eisenstadt: { lat: 47.8456, lon: 16.5233, region: "Burgenland" },
  },
  ch: {
    bern: { lat: 46.948, lon: 7.4474, region: "Kanton Bern" },
    basel: { lat: 47.5596, lon: 7.5886, region: "Basel-Stadt" },
    luzern: { lat: 47.0502, lon: 8.3093, region: "Kanton Luzern" },
    "st-gallen": { lat: 47.4245, lon: 9.3767, region: "Kanton St. Gallen" },
    winterthur: { lat: 47.4988, lon: 8.7237, region: "Kanton Zürich" },
    zuerich: { lat: 47.3769, lon: 8.5417, region: "Kanton Zürich" },
    lausanne: { lat: 46.5197, lon: 6.6323, region: "Kanton Waadt" },
    genf: { lat: 46.2044, lon: 6.1432, region: "Kanton Genf" },
    thun: { lat: 46.758, lon: 7.628, region: "Kanton Bern" },
    schaffhausen: { lat: 47.6973, lon: 8.6349, region: "Kanton Schaffhausen" },
    biel: { lat: 47.1368, lon: 7.2468, region: "Kanton Bern" },
    chur: { lat: 46.8508, lon: 9.532, region: "Kanton Graubünden" },
    zug: { lat: 47.1662, lon: 8.5155, region: "Kanton Zug" },
    fribourg: { lat: 46.8065, lon: 7.1619, region: "Kanton Freiburg" },
    aarau: { lat: 47.3925, lon: 8.0444, region: "Kanton Aargau" },
  },
};

export function cityGeo(market: MarketCode, slug: string): Geo | null {
  return GEO[market][slug] ?? null;
}

export function distanceKm(a: Geo, b: Geo): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}

export function nearestCities<T extends { slug: string }>(market: MarketCode, slug: string, pages: T[], count = 5): (T & { km: number })[] {
  const origin = cityGeo(market, slug);
  if (!origin) return [];
  return pages
    .filter((page) => page.slug !== slug && cityGeo(market, page.slug))
    .map((page) => ({ ...page, km: distanceKm(origin, cityGeo(market, page.slug)!) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count);
}
