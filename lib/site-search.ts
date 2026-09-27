// Seitensuche unter /ueber-uns/suche/: reine Funktionen ohne Datenzugriff, damit sie testbar bleiben.
// Die Seite sammelt die Dokumente aus den vorhandenen Loadern (WordPress mit Cache, Stadt-JSON).

export type SearchDocument = {
  /** Bereich auf der Ergebniskarte, z. B. „Magazin“, „Stadt · Österreich“. */
  section: string;
  title: string;
  /** Kurzer Anreißer (Klartext). */
  summary: string;
  /** Volltext (Klartext) für Treffer außerhalb von Titel und Anreißer. */
  body: string;
  /** Markt und Seitenpfad – der Link wird mit den Href-Helfern des Projekts gebaut. */
  market: "de" | "at" | "ch";
  path: string;
};

export type SearchResult = SearchDocument & { score: number; snippet: string };

export const SEARCH_MAX_RESULTS = 50;
export const SEARCH_MAX_QUERY_LENGTH = 100;

/** Kleinschreibung, ä/ö/ü/ß ≙ ae/oe/ue/ss, übrige Diakritika weg, Satzzeichen zu Leerzeichen. */
export function normalizeSearchText(text = ""): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function searchTerms(query = ""): string[] {
  const terms = normalizeSearchText(query.slice(0, SEARCH_MAX_QUERY_LENGTH)).split(" ").filter(Boolean);
  return [...new Set(terms)];
}

function snippetFor(doc: SearchDocument, terms: string[], length = 180): string {
  const summary = doc.summary.trim();
  const normalizedSummary = normalizeSearchText(summary);
  const inSummary = terms.some((term) => normalizedSummary.includes(term));
  let text = summary && (inSummary || !doc.body) ? summary : "";

  if (!text && doc.body) {
    // Ausschnitt rund um den ersten Treffer im Volltext (Wortgrenzen, grob).
    const words = doc.body.split(/\s+/);
    const index = words.findIndex((word) => terms.some((term) => normalizeSearchText(word).includes(term)));
    const start = Math.max(0, index - 8);
    text = `${start > 0 ? "… " : ""}${words.slice(start, start + 40).join(" ")}`;
  }
  if (!text) text = summary;
  return text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, "")} …` : text;
}

/**
 * Alle Suchbegriffe müssen irgendwo im Dokument vorkommen. Ranking: Titel vor Anreißer vor Volltext,
 * Titel, der mit dem Begriff beginnt oder ihm entspricht, ganz vorn.
 */
export function searchDocuments(documents: SearchDocument[], query: string, limit = SEARCH_MAX_RESULTS): SearchResult[] {
  const terms = searchTerms(query);
  if (!terms.length) return [];
  const phrase = terms.join(" ");

  const results: SearchResult[] = [];
  for (const doc of documents) {
    const title = normalizeSearchText(doc.title);
    const summary = normalizeSearchText(doc.summary);
    const body = normalizeSearchText(doc.body);
    let score = 0;
    let matchedAll = true;

    for (const term of terms) {
      if (title.includes(term)) {
        score += 100;
        if (title.split(" ").some((word) => word.startsWith(term))) score += 20;
      } else if (summary.includes(term)) {
        score += 30;
      } else if (body.includes(term)) {
        score += 10;
      } else {
        matchedAll = false;
        break;
      }
    }
    if (!matchedAll) continue;
    if (title === phrase) score += 200;
    else if (title.startsWith(phrase)) score += 80;
    else if (title.includes(phrase)) score += 40;

    results.push({ ...doc, score, snippet: snippetFor(doc, terms) });
  }

  return results
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "de"))
    .slice(0, limit);
}
