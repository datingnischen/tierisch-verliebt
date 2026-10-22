import type { MarketCode } from "@/lib/markets";

const STRIPES: Record<"de" | "at" | "nl", readonly string[]> = {
  de: ["#000", "#dd0000", "#ffce00"],
  at: ["#c8102e", "#fff", "#c8102e"],
  nl: ["#ae1c28", "#fff", "#21468b"],
};

/**
 * Landesflagge als SVG (Windows zeigt keine Flaggen-Emojis). "it" ist die italienische Schweiz:
 * links Schweizer Kreuz, rechts Tricolore, bewusst keine reine Italien-Flagge.
 */
export function MarketFlag({ market }: { market: MarketCode }) {
  if (market === "ch") return <svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#d52b1e"/><path d="M13 4h4v4h4v4h-4v4h-4v-4H9V8h4z" fill="#fff"/></svg>;
  if (market === "it") return <svg viewBox="0 0 30 20" aria-hidden="true"><rect width="15" height="20" fill="#d52b1e"/><path d="M6 5h3v3.5h3.5v3H9V15H6v-3.5H2.5v-3H6z" fill="#fff"/><rect x="15" width="5" height="20" fill="#009246"/><rect x="20" width="5" height="20" fill="#fff"/><rect x="25" width="5" height="20" fill="#ce2b37"/></svg>;
  return <svg viewBox="0 0 30 20" preserveAspectRatio="none" aria-hidden="true">{STRIPES[market].map((fill, i) => <rect key={i} y={i * 20 / 3} width="30" height={20 / 3 + 0.1} fill={fill}/>)}</svg>;
}

/** Land bzw. Sprachvariante unten im Menü: Flagge, Name für Screenreader und als Tooltip. */
export function MenuMarketFlag({ market, label }: { market: MarketCode; label: string }) {
  return <span className="menu-market-label" title={label}><MarketFlag market={market}/><span className="sr-only">{label}</span></span>;
}
