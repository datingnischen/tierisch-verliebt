import { decodeHtmlEntities, stripHtml } from "#magazine";

export type MagazineFaqItem = {
  id: string;
  question: string;
  answerHtml: string;
  answerText: string;
};

type FaqGraphInput = {
  items: MagazineFaqItem[];
  pageUrl: string;
  pageName: string;
};

// „FAQ“, „FAQs“, „FAQ`s“, „FAQ's“, „Häufige Fragen zum Mops“, „Häufig gestellte Fragen“ …
export const FAQ_HEADING_PATTERN = /^(faq(?:[`'’´]?s)?|h[aä]ufige fragen\b.*|h[aä]ufig gestellte fragen\b.*|fragen und antworten\b.*)$/i;

type FaqSection = {
  start: number;
  bodyEnd: number;
  /** Inhalt vor der ersten Frage (z. B. ein Bild) – bleibt vor der FAQ-Karte stehen. */
  preamble: string;
  items: MagazineFaqItem[];
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function getMagazineFaqSubject(title: string) {
  const plain = decodeHtmlEntities(title).trim();
  const [subject] = plain.split(/\s+[–—|]\s+|\s*:\s+/);
  return (subject || plain).trim();
}

const HEADING = /<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;

function headingText(html: string) {
  return decodeHtmlEntities(stripHtml(html)).replace(/\s*:$/, "");
}

const isQuestion = (text: string) => /\?$/.test(text);

// Fragen stehen in WordPress in drei Formaten:
// 1. <h3>Frage?</h3><p>Antwort</p>                     (auch <h4>)
// 2. <p><strong>Frage?</strong></p><p>Antwort</p>
// 3. <p><strong>Frage?</strong><br>Antwort</p>
const QUESTION = /<h([34])\b[^>]*>([\s\S]*?)<\/h\1>|<p\b[^>]*>\s*<(strong|b)\b[^>]*>((?:(?!<\/\3>|<\/?p\b)[\s\S])*?)<\/\3>\s*(<\/p>|<br\b[^>]*>)/gi;

function parseFaqItems(body: string) {
  const markers = [...body.matchAll(QUESTION)]
    .map((match) => {
      const inline = match[4] !== undefined;
      const question = headingText(inline ? match[4] : match[2]);
      return {
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
        question,
        inline,
        // Format 3: Der Rest des Absatzes ist schon die Antwort.
        answerPrefix: inline && /^<br/i.test(match[5]) ? "<p>" : "",
      };
    })
    // Fett gesetzter Text ist nur dann eine Frage, wenn er auch so endet.
    .filter((marker) => marker.question && (!marker.inline || isQuestion(marker.question)));

  const items = markers
    .map((marker, index) => {
      const answerHtml = `${marker.answerPrefix}${body.slice(marker.end, markers[index + 1]?.start ?? body.length)}`.trim();
      return {
        id: `faq-frage-${index + 1}`,
        question: marker.question,
        answerHtml,
        answerText: stripHtml(answerHtml),
      };
    })
    .filter((item) => item.question && item.answerText)
    .map((item, index) => ({ ...item, id: `faq-frage-${index + 1}` }));

  return { items, preamble: markers.length ? body.slice(0, markers[0].start).trim() : "" };
}

function findFaqSection(html: string): FaqSection | null {
  const headings = [...html.matchAll(HEADING)].map((match) => ({
    level: Number(match[1]),
    text: headingText(match[2]),
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));
  const headingIndex = headings.findIndex((heading) => heading.level <= 3 && FAQ_HEADING_PATTERN.test(heading.text));
  if (headingIndex === -1) return null;

  const heading = headings[headingIndex];
  // Der Abschnitt endet an der nächsten gleich- oder höherrangigen Überschrift –
  // außer bei „<h3>FAQ</h3>“, wo die Fragen selbst h3 sein dürfen.
  const next = headings
    .slice(headingIndex + 1)
    .find((entry) => entry.level < heading.level || (entry.level === heading.level && !(heading.level === 3 && isQuestion(entry.text))));
  const bodyEnd = next ? next.start : html.length;

  return { start: heading.start, bodyEnd, ...parseFaqItems(html.slice(heading.end, bodyEnd)) };
}

export function getMagazineFaqItems(html: string): MagazineFaqItem[] {
  return findFaqSection(html)?.items ?? [];
}

export function renderMagazineFaqSection(html: string, subject: string) {
  const section = findFaqSection(html);
  if (!section || !section.items.length) return html;

  const card = [
    '<section class="breed-faq-card" id="faq" aria-labelledby="faq-titel">',
    '  <div class="breed-faq-header">',
    '    <span class="eyebrow eyebrow-brand">FAQ</span>',
    '    <h2 id="faq-titel">Häufige Fragen</h2>',
    `    <p>Die häufigsten Fragen zum Thema „${escapeHtml(subject)}“ — kompakt beantwortet.</p>`,
    '  </div>',
    '  <div class="breed-faq-list">',
    ...section.items.map((item, index) => [
      `    <details class="breed-faq-item" id="${item.id}"${index === 0 ? " open" : ""}>`,
      `      <summary>${escapeHtml(item.question)}</summary>`,
      `      <div class="breed-faq-answer">${item.answerHtml}</div>`,
      '    </details>',
    ].join("\n")),
    '  </div>',
    '</section>',
  ].join("\n");

  const preamble = section.preamble ? `${section.preamble}\n` : "";
  return `${html.slice(0, section.start)}${preamble}${card}${html.slice(section.bodyEnd)}`;
}

export function buildMagazineFaqGraph({ items, pageUrl, pageName }: FaqGraphInput) {
  if (!items.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: `${pageUrl}#faq`,
    name: pageName,
    inLanguage: "de-DE",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      "@id": `${pageUrl}#${item.id}`,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answerText,
      },
    })),
  };
}
