// Quellen im Magazin: klein, standardmäßig zugeklappt und als eigener Block ans
// Ende des Beitrags. Inhalte, Bildnachweise und Links bleiben vollständig erhalten.

const SOURCE_HEADING = /<h([23])\b[^>]*>((?:(?!<\/h\1>)[\s\S])*?Quell(?:en|e)\b(?:(?!<\/h\1>)[\s\S])*?)<\/h\1>/gi;
// „Stand, Quellen & Transparenz“, „Genutzte Quellen“, „📚 Quellen“, „Quelle“ …
const SOURCE_TITLE = /^(?:[^\p{L}\p{N}]+)?(?:Stand,\s*)?(?:Genutzte\s+|Verwendete\s+)?Quellen?[^?]*$/iu;

// Bildnachweise und Quellenangaben als eigener Absatz: „Bildquelle: …“, „Titelbild: …“,
// <p class="bildnachweis">, „Quelle:“ mit nachfolgenden Link-Absätzen.
const PARAGRAPH = /<p\b([^>]*)>((?:(?!<\/?p\b)[\s\S])*?)<\/p>/gi;
const CREDIT_TEXT = /^(?:Bildquellen?|Bildnachweise?|Titelbild|Quellen?)\s*:/i;
const BARE_SOURCE_LABEL = /^Quellen?\s*:$/i;
const URL_ONLY = /^(?:https?:\/\/|www\.)\S+$/i;

export const MAGAZINE_SOURCES_CLASS = "magazine-sources";

function headingText(inner: string) {
  return inner
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|#038);/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionEnd(html: string, from: number, level: string) {
  // Ein h2-Abschnitt endet am nächsten h2 bzw. an einer eingebauten Sektion
  // (FAQ-Karte), ein alleinstehender h3-Abschnitt schon am nächsten h2/h3.
  const stop = level === "2" ? /<h2\b|<section\b/gi : /<h[23]\b|<section\b/gi;
  stop.lastIndex = from;
  const match = stop.exec(html);
  return match ? match.index : html.length;
}

function cleanCredit(html: string) {
  // WordPress-Altlast: „Bildquelle: <https://…>“ wurde als &lt;…&gt; um das </small> herum gespeichert.
  return html
    .replace(/(:\s*)&lt;(?=https?:)/gi, "$1")
    .replace(/(<\/small>)\s*&gt;/gi, "$1")
    .trim();
}

function extractCreditParagraphs(html: string) {
  const credits: string[] = [];
  let rest = html;
  for (let guard = 0; guard < 20; guard += 1) {
    PARAGRAPH.lastIndex = 0;
    let match: RegExpExecArray | null;
    let found: { start: number; end: number; html: string } | null = null;
    while ((match = PARAGRAPH.exec(rest))) {
      const text = headingText(match[2]).replace(/^[<>\s]+/, "");
      const isCredit = /\bclass="[^"]*\bbildnachweis\b/i.test(match[1]) || CREDIT_TEXT.test(text);
      if (!isCredit) continue;
      let end = match.index + match[0].length;
      let block = match[0];
      if (BARE_SOURCE_LABEL.test(text)) {
        // „Quelle:“ allein – die folgenden Absätze mit nackten Adressen gehören dazu.
        const follower = /^\s*<p\b[^>]*>((?:(?!<\/?p\b)[\s\S])*?)<\/p>/i;
        for (let next = follower.exec(rest.slice(end)); next && URL_ONLY.test(headingText(next[1])); next = follower.exec(rest.slice(end))) {
          block += `\n${next[0].trim()}`;
          end += next[0].length;
        }
      }
      found = { start: match.index, end, html: block };
      break;
    }
    if (!found) break;
    credits.push(cleanCredit(found.html));
    rest = `${rest.slice(0, found.start)}${rest.slice(found.end)}`;
  }
  return { html: rest, credits };
}

export function collapseSourceSections(html: string, summaryLabel = "Quellen & Transparenz") {
  if (!html || html.includes(`class="${MAGAZINE_SOURCES_CLASS}"`)) return html;

  const parts: string[] = [];
  let rest = html;
  for (let guard = 0; guard < 10; guard += 1) {
    SOURCE_HEADING.lastIndex = 0;
    let match: RegExpExecArray | null;
    let found: { start: number; end: number; body: string } | null = null;
    while ((match = SOURCE_HEADING.exec(rest))) {
      const text = headingText(match[2]);
      // Ratgeberfragen wie „Welche Quellen sind verlässlich?“ sind Inhalt.
      if (!SOURCE_TITLE.test(text)) continue;
      const bodyStart = match.index + match[0].length;
      const end = sectionEnd(rest, bodyStart, match[1]);
      const body = rest.slice(bodyStart, end).trim();
      // Der h2-Titel selbst entfällt, die Summary ersetzt ihn; Unterüberschriften
      // wie „Genutzte Quellen“ bleiben als Zwischentitel erhalten.
      found = {
        start: match.index,
        end,
        body: match[1] === "2" ? body : `<p class="magazine-sources__label">${match[2].trim()}</p>${body}`,
      };
      break;
    }
    if (!found) break;
    parts.push(found.body);
    rest = `${rest.slice(0, found.start)}${rest.slice(found.end)}`;
  }

  const credits = extractCreditParagraphs(rest);
  rest = credits.html;
  parts.push(...credits.credits);

  if (!parts.length) return html;

  const body = parts.join("\n").replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, '<p class="magazine-sources__label">$1</p>');
  const label = summaryLabel.replace(/&(?!amp;)/g, "&amp;");
  return `${rest.trimEnd()}\n<details class="${MAGAZINE_SOURCES_CLASS}">\n<summary>${label}</summary>\n<div class="magazine-sources__body">\n${body}\n</div>\n</details>\n`;
}
