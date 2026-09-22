import { decodeHtmlEntities, stripHtml } from "#wordpress";

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

const FAQ_HEADING_PATTERN = /^(faqs?|h[aä]ufige fragen\b.*|h[aä]ufig gestellte fragen\b.*|fragen und antworten\b.*)$/i;

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

function findFaqSection(html: string) {
  const heading = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)]
    .find((match) => FAQ_HEADING_PATTERN.test(stripHtml(match[1])));
  if (!heading || heading.index === undefined) return null;

  const bodyStart = heading.index + heading[0].length;
  const nextHeading = html.slice(bodyStart).search(/<h2\b/i);
  const bodyEnd = nextHeading === -1 ? html.length : bodyStart + nextHeading;

  return { start: heading.index, bodyEnd, body: html.slice(bodyStart, bodyEnd) };
}

export function getMagazineFaqItems(html: string): MagazineFaqItem[] {
  const section = findFaqSection(html);
  if (!section) return [];

  return [...section.body.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>\s*([\s\S]*?)(?=<h3\b|$)/gi)]
    .map((match, index) => {
      const answerHtml = match[2].trim();
      return {
        id: `faq-frage-${index + 1}`,
        question: decodeHtmlEntities(stripHtml(match[1])),
        answerHtml,
        answerText: stripHtml(answerHtml),
      };
    })
    .filter((item) => item.question && item.answerText);
}

export function renderMagazineFaqSection(html: string, subject: string) {
  const section = findFaqSection(html);
  const items = getMagazineFaqItems(html);
  if (!section || !items.length) return html;

  const card = [
    '<section class="breed-faq-card" id="faq" aria-labelledby="faq-titel">',
    '  <div class="breed-faq-header">',
    '    <span class="eyebrow eyebrow-brand">FAQ</span>',
    '    <h2 id="faq-titel">Häufige Fragen</h2>',
    `    <p>Die häufigsten Fragen zum Thema „${escapeHtml(subject)}“ — kompakt beantwortet.</p>`,
    '  </div>',
    '  <div class="breed-faq-list">',
    ...items.map((item, index) => [
      `    <details class="breed-faq-item" id="${item.id}"${index === 0 ? " open" : ""}>`,
      `      <summary>${escapeHtml(item.question)}</summary>`,
      `      <div class="breed-faq-answer">${item.answerHtml}</div>`,
      '    </details>',
    ].join("\n")),
    '  </div>',
    '</section>',
  ].join("\n");

  return `${html.slice(0, section.start)}${card}${html.slice(section.bodyEnd)}`;
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
