import type { NextRequest } from "next/server.js";
import { NextResponse } from "next/server.js";
import { resolveMarketRequest, type MarketCode } from "#markets";

const INTERNAL_REWRITE_TOKEN = globalThis.crypto.randomUUID();
const MARKET_HOSTS = new Set(["tierisch-verliebt.de", "tierisch-verliebt.at", "tierisch-verliebt.ch"]);

function normalizeHost(value: string | null) { return value?.split(",")[0]?.trim().toLowerCase().replace(/:\d+$/, "").replace(/^www\./, "") ?? ""; }
export function requestHostname(request: NextRequest) { const direct=normalizeHost(request.headers.get("host")),forwarded=normalizeHost(request.headers.get("x-forwarded-host")); if(MARKET_HOSTS.has(direct))return direct;if(MARKET_HOSTS.has(forwarded))return forwarded;return direct||forwarded||request.nextUrl.hostname; }
function handoff(url:string){const escaped=url.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return new NextResponse(`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${escaped}"><title>Weiterleitung</title></head><body><p>Weiter zur bestehenden Plattform: <a href="${escaped}">${escaped}</a></p><script>location.replace(${JSON.stringify(url)})</script></body></html>`,{status:200,headers:{"cache-control":"no-store","content-type":"text/html; charset=utf-8"}});}

export function proxy(request: NextRequest) {
  const destinationHeader=request.headers.get("x-tv-rewrite-destination"),token=request.headers.get("x-tv-rewrite-token");
  if(token===INTERNAL_REWRITE_TOKEN&&destinationHeader===request.nextUrl.pathname)return NextResponse.next();
  const resolution=resolveMarketRequest(request.nextUrl.pathname,requestHostname(request));
  if(resolution.action==="pass")return NextResponse.next();
  if(resolution.action==="not-found")return new NextResponse("Not found",{status:404});
  if(resolution.action==="redirect-platform")return handoff(resolution.url);
  const destination=request.nextUrl.clone();destination.pathname=resolution.pathname;
  if(resolution.action==="placeholder")destination.searchParams.set("requestedPath",resolution.requestedPath);
  const headers=new Headers(request.headers);headers.set("x-tv-rewrite-destination",destination.pathname);headers.set("x-tv-rewrite-token",INTERNAL_REWRITE_TOKEN);headers.set("x-tv-market",resolution.market as MarketCode);
  return NextResponse.rewrite(destination,{request:{headers}});
}

export const config={matcher:["/((?!_next/static|_next/image|app-assets/).*)"]};
