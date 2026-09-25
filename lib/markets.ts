export const MARKET_CODES = ["de", "at", "ch"] as const;
export type MarketCode = (typeof MARKET_CODES)[number];
export type RegionalMarket = Exclude<MarketCode, "de">;

export type MarketConfig = {
  code: MarketCode;
  countryName: string;
  domain: string;
  locale: "de-DE" | "de-AT" | "de-CH";
  platformId: string;
};

const MARKETS: Record<MarketCode, MarketConfig> = {
  de: { code: "de", countryName: "Deutschland", domain: "tierisch-verliebt.de", locale: "de-DE", platformId: "tierischverliebt" },
  at: { code: "at", countryName: "Österreich", domain: "tierisch-verliebt.at", locale: "de-AT", platformId: "tierischverliebtat" },
  ch: { code: "ch", countryName: "Schweiz", domain: "tierisch-verliebt.ch", locale: "de-CH", platformId: "tierischverliebtch" },
};

export function isMarketCode(value: string): value is MarketCode {
  return MARKET_CODES.includes(value as MarketCode);
}

export function getMarket(code: MarketCode): MarketConfig {
  return MARKETS[code];
}

const FILE_PATH_PATTERN = /\/[^/]*\.[a-z0-9]+$/i;

/**
 * Seitenpfade enden immer auf einen Schrägstrich, wie die ICONY-Plattform (/login/, /suche/).
 * Dateien wie /sitemap.xml bleiben ohne. Query und Anker hängen hinter dem Schrägstrich.
 */
export function withTrailingSlash(pathname: string): string {
  const match = pathname.match(/^([^?#]*)(.*)$/);
  const path = match?.[1] ?? pathname;
  const suffix = match?.[2] ?? "";
  if (!path || path.endsWith("/") || FILE_PATH_PATTERN.test(path)) {
    return `${path || "/"}${suffix}`;
  }
  return `${path}/${suffix}`;
}

/** Absolute URL auf der Live-Domain des Markts, Seitenpfade mit Schrägstrich am Ende. */
export function publicUrl(market: MarketCode, pathname = "/"): string {
  const trimmed = pathname.replace(/^\/+/, "");
  return `https://${getMarket(market).domain}${withTrailingSlash(`/${trimmed}`)}`;
}

/** Vorschau-Hosts (lokal, Vercel): Dort liegen alle Märkte unter /de, /at, /ch. */
export function isPreviewHost(hostname = ""): boolean {
  const host = hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".vercel.app");
}

/** Pfad einer Next.js-Seite auf dem Vorschau-Host, z. B. ("ch", "/partnersuche/zuerich") → "/ch/partnersuche/zuerich/". */
export function previewPath(market: MarketCode, pathname = "/"): string {
  const normalized = pathname === "/" ? "" : `/${pathname.replace(/^\/+/, "")}`;
  return withTrailingSlash(`/${market}${normalized}`);
}

const DE_NEXT_PAGE = /^\/(?:partnersuche|magazin|ueber-uns|bewertungen-und-erfahrungen)(?:\/|$)/;
const REGIONAL_NEXT_PAGE = /^\/partnersuche(?:\/[a-z0-9-]+)?\/?$/;

/**
 * Live-URL einer Seite, die Next.js selbst rendert, auf den Vorschau-Pfad abbilden (für Links im
 * importierten HTML). ICONY-Seiten (Login, Suche, Impressum …) bleiben null und damit live.
 */
export function previewPathForUrl(href: string): string | null {
  let url: URL;
  try { url = new URL(href); } catch { return null; }
  const market = marketForHostname(url.hostname);
  if (!market || url.search) return null;
  const path = url.pathname || "/";
  const served = path === "/" || (market === "de" ? DE_NEXT_PAGE : REGIONAL_NEXT_PAGE).test(path);
  return served ? `${previewPath(market, path)}${url.hash}` : null;
}

export type MarketRequestResolution =
  | { action: "pass" }
  | { action: "not-found" }
  | { action: "rewrite"; market: "de"; pathname: string }
  | { action: "market-home"; market: RegionalMarket; pathname: string }
  | { action: "market-partnersuche"; market: RegionalMarket; pathname: string }
  | { action: "market-partnersuche-city"; market: RegionalMarket; pathname: string; slug: string }
  | { action: "market-robots"; market: RegionalMarket; pathname: string }
  | { action: "market-sitemap"; market: RegionalMarket; pathname: string }
  | { action: "redirect-platform"; market: RegionalMarket; url: string }
  | { action: "placeholder"; market: RegionalMarket; pathname: string; requestedPath: string };

const INTERNAL_PATH = /^\/market-(?:home|partnersuche|placeholder|robots|sitemap)(?:\/|$)/;
const PLATFORM_PATH = /^\/(?:login|registration|suche)(?:\/|$)/;
const PASS_PREFIXES = ["/_next/", "/app-assets/", "/api/", "/.well-known/"];
const STATIC_FILE = /\.(?:avif|css|gif|ico|jpe?g|js|json|map|png|svg|webp|woff2?)$/i;

function shouldPass(pathname: string) {
  return pathname === "/favicon.ico" || PASS_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || STATIC_FILE.test(pathname);
}

export function marketForHostname(hostname = ""): MarketCode | null {
  const normalized = hostname.toLowerCase().split(",")[0].trim().replace(/:\d+$/, "").replace(/^www\./, "");
  return MARKET_CODES.find((market) => getMarket(market).domain === normalized) ?? null;
}

function resolveRegional(market: RegionalMarket, requestedPath: string, productionHost: boolean): MarketRequestResolution {
  if (INTERNAL_PATH.test(requestedPath)) return { action: "not-found" };
  const path = requestedPath.length > 1 ? requestedPath.replace(/\/+$/, "") : requestedPath;
  if (path === "/") return { action: "market-home", market, pathname: `/market-home/${market}` };
  if (path === "/partnersuche") return { action: "market-partnersuche", market, pathname: `/market-partnersuche/${market}` };
  const city = path.match(/^\/partnersuche\/([a-z0-9-]+)$/)?.[1];
  if (city) return { action: "market-partnersuche-city", market, pathname: `/market-partnersuche/${market}/${city}`, slug: city };
  if (path === "/robots.txt") return { action: "market-robots", market, pathname: `/market-robots/${market}` };
  if (path === "/sitemap.xml") return { action: "market-sitemap", market, pathname: `/market-sitemap/${market}` };
  if (PLATFORM_PATH.test(path) && !productionHost) return { action: "redirect-platform", market, url: publicUrl(market, path) };
  return { action: "placeholder", market, pathname: `/market-placeholder/${market}`, requestedPath: path };
}

export function resolveMarketRequest(pathname: string, hostname = ""): MarketRequestResolution {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (shouldPass(normalized)) return { action: "pass" };
  if (INTERNAL_PATH.test(normalized)) return { action: "not-found" };

  const hostMarket = marketForHostname(hostname);
  if (hostMarket) {
    const prefixed = normalized.match(/^\/(?:de|at|ch)(\/.*)?$/);
    const hostPath = prefixed ? prefixed[1] || "/" : normalized;
    return hostMarket === "de"
      ? { action: "rewrite", market: "de", pathname: hostPath }
      : resolveRegional(hostMarket, hostPath, true);
  }

  const match = normalized.match(/^\/(de|at|ch)(\/.*)?$/);
  if (!match) return { action: "rewrite", market: "de", pathname: normalized };
  const market = match[1] as MarketCode;
  const requestedPath = match[2] || "/";
  if (INTERNAL_PATH.test(requestedPath)) return { action: "not-found" };
  return market === "de"
    ? { action: "rewrite", market: "de", pathname: requestedPath }
    : resolveRegional(market, requestedPath, false);
}
