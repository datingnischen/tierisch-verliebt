export type CityQuizHint = { before: string; anchor: string; href: string; after: string };

/**
 * Redaktioneller Hinweis auf eine eigene Verteilerseite, bewusst nur auf einzelnen Stadtseiten und nicht in der
 * Vorlage für alle Städte. Kassel steht als eigene Stadtseite direkt in data/partnersuche-eigene-staedte.json;
 * Köln ist eine importierte Seite, deshalb liegt der Hinweis hier (2026-11-21, koelner-singles.de).
 */
const HINTS: Record<string, CityQuizHint> = {
  "de:koeln": {
    before: "Dir ist die Gassirunde zu zweit wichtig, aber nicht das einzige Thema? Der ",
    anchor: "Veedel-Check für Kölner Singles",
    href: "https://koelner-singles.de/#quiz",
    after: " stellt dir drei Fragen und zeigt dir, welche Kölner Nischenbörsen noch zu dir passen.",
  },
};

export function cityQuizHint(market: string, slug: string): CityQuizHint | null {
  return HINTS[`${market}:${slug}`] ?? null;
}
