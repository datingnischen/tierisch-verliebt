import type { NextRequest } from "next/server.js";
import { NextResponse } from "next/server.js";
import { isMarketCode, marketForHostname, publicUrl, resolveMarketRequest, withTrailingSlash, type MarketCode } from "#markets";

const INTERNAL_REWRITE_TOKEN = globalThis.crypto.randomUUID();
const MARKET_HOSTS = new Set(["tierisch-verliebt.de", "tierisch-verliebt.at", "tierisch-verliebt.ch"]);

function normalizeHost(value: string | null) { return value?.split(",")[0]?.trim().toLowerCase().replace(/:\d+$/, "").replace(/^www\./, "") ?? ""; }
export function requestHostname(request: NextRequest) { const direct=normalizeHost(request.headers.get("host")),forwarded=normalizeHost(request.headers.get("x-forwarded-host")); if(MARKET_HOSTS.has(direct))return direct;if(MARKET_HOSTS.has(forwarded))return forwarded;return direct||forwarded||request.nextUrl.hostname; }
function handoff(url:string){const escaped=url.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return new NextResponse(`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${escaped}"><title>Weiterleitung</title></head><body><p>Weiter zur bestehenden Plattform: <a href="${escaped}">${escaped}</a></p><script>location.replace(${JSON.stringify(url)})</script></body></html>`,{status:200,headers:{"cache-control":"no-store","content-type":"text/html; charset=utf-8"}});}

const NO_SLASH_PREFIXES = ["/_next/", "/app-assets/", "/api/", "/.well-known/"];
const INTERNAL_PATH = /^\/market-(?:home|partnersuche|placeholder|robots|sitemap)(?:\/|$)/;

// Seitenpfade enden immer auf "/" (wie die ICONY-Plattform). Ersetzt die eingebaute Slash-Umleitung von
// Next.js (skipTrailingSlashRedirect): Die kennt nur den Upstream-Pfad. nginx ruft für tierisch-verliebt.at/faq
// hier /at/faq auf, eine relative Umleitung auf /at/faq/ landete beim Besucher als tierisch-verliebt.at/at/faq/.
// Das Länderpräfix ist intern, Pfade damit gehen darum absolut auf die Landesdomain ohne Präfix.
export function trailingSlashRedirect(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (
    pathname.endsWith("/")
    || withTrailingSlash(pathname) === pathname
    || NO_SLASH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    || INTERNAL_PATH.test(pathname)
  ) return null;

  const target = withTrailingSlash(pathname);
  const prefixed = target.match(/^\/(de|at|ch)(\/.*)$/);
  if (prefixed && isMarketCode(prefixed[1])) {
    // Auf einer Landesdomain entscheidet der Host über den Markt (wie in resolveMarketRequest).
    const market = marketForHostname(requestHostname(request)) ?? prefixed[1];
    return NextResponse.redirect(`${publicUrl(market, prefixed[2])}${search}`, 308);
  }

  // Plain URL statt nextUrl.clone(): NextURL normalisiert den Schrägstrich sonst selbst.
  const destination = new URL(request.nextUrl.href);
  destination.pathname = target;
  return NextResponse.redirect(destination, 308);
}

export function proxy(request: NextRequest) {
  const destinationHeader=request.headers.get("x-tv-rewrite-destination"),token=request.headers.get("x-tv-rewrite-token");
  if(token===INTERNAL_REWRITE_TOKEN&&destinationHeader===request.nextUrl.pathname)return NextResponse.next();
  const slashRedirect=trailingSlashRedirect(request);
  if(slashRedirect)return slashRedirect;
  const resolution=resolveMarketRequest(request.nextUrl.pathname,requestHostname(request));
  if(resolution.action==="pass")return NextResponse.next();
  if(resolution.action==="not-found")return new NextResponse("Not found",{status:404});
  if(resolution.action==="redirect-platform")return handoff(resolution.url);
  const destination=request.nextUrl.clone();destination.pathname=resolution.pathname;
  if(resolution.action==="placeholder")destination.searchParams.set("requestedPath",resolution.requestedPath);
  const headers=new Headers(request.headers);headers.set("x-tv-rewrite-destination",destination.pathname);headers.set("x-tv-rewrite-token",INTERNAL_REWRITE_TOKEN);headers.set("x-tv-market",resolution.market as MarketCode);
  return NextResponse.rewrite(destination,{request:{headers}});
}

export const config={matcher:["/((?!_next/static|_next/image|icon.png|apple-icon.png|app-assets/).*)"]};
