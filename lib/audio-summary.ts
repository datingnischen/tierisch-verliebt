// Audio-Zusammenfassung im Magazin: Der WordPress-Block zwischen den Markern
// <!-- audio-summary:start/end --> wird zu einer eigenen Hörkarte mit Kopfzeile,
// Player über die volle Breite und Hinweis auf die synthetische Stimme.

const AUDIO_BLOCK = /(?:<p>\s*)?<!--\s*audio-summary:start\s*-->(?:\s*<\/p>)?([\s\S]*?)(?:<p>\s*)?(?:<br\s*\/?>\s*)?<!--\s*audio-summary:end\s*-->(?:\s*<\/p>)?/i;
const SOURCE = /<source\b[^>]*\bsrc="([^"]+)"[^>]*>/i;
const AUDIO_SRC = /<audio\b[^>]*\bsrc="([^"]+)"[^>]*>/i;
const HEADING = /<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/i;
const PARAGRAPH = /<p\b[^>]*>((?:(?!<\/?p\b|<audio\b)[\s\S])*?)<\/p>/i;

export const AUDIO_SUMMARY_CLASS = "magazine-audio";

function plain(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function enhanceAudioSummary(html: string) {
  const block = AUDIO_BLOCK.exec(html);
  if (!block) return html;
  const inner = block[1];
  const src = SOURCE.exec(inner)?.[1] ?? AUDIO_SRC.exec(inner)?.[1];
  if (!src) return html;
  const heading = plain(HEADING.exec(inner)?.[1] ?? "") || "Artikel kurz anhören";
  const intro = plain(PARAGRAPH.exec(inner.replace(HEADING, ""))?.[1] ?? "");

  const card = [
    `<section class="${AUDIO_SUMMARY_CLASS}" aria-label="${heading}">`,
    `<div class="magazine-audio-head">`,
    `<span class="magazine-audio-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 14a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-2v-6h4M4 14v3a2 2 0 0 0 2 2h2v-6H4"/></svg></span>`,
    `<div>`,
    `<p class="magazine-audio-kicker">Audio-Zusammenfassung</p>`,
    `<p class="magazine-audio-title">${heading}</p>`,
    `</div>`,
    `</div>`,
    intro ? `<p class="magazine-audio-intro">${intro}</p>` : "",
    `<audio class="magazine-audio-player" controls preload="metadata" src="${src}">Dein Browser unterstützt das Audio-Element nicht.</audio>`,
    `<p class="magazine-audio-note">Von der Redaktion geschrieben, von einer KI-Stimme gesprochen.</p>`,
    `</section>`,
  ]
    .filter(Boolean)
    .join("\n");

  return html.slice(0, block.index) + card + html.slice(block.index + block[0].length);
}
