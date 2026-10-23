import { handleWpRest, wpRestPreflight, wpRestResponse } from "@/lib/wp-rest-compat";
import { isTeaserImageRoute, teaserImageResponse } from "@/lib/teaser-image";
import { MARKET_TEASER_PARAM, marketTeaserSourceFor } from "@/lib/wp-market-teasers";

// WordPress-kompatibler REST-Endpunkt (aus den Magazin-Dateien erzeugt), siehe lib/wp-rest-compat.ts.
// Die URL bleibt wie im früheren WordPress: https://tierisch-verliebt.de/magazin/wp-json/wp/v2/posts
// (proxy.ts nimmt sie von der Slash-Umleitung aus; auf Vorschau-Hosts auch unter /de/magazin/wp-json/…).
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ route?: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  const { route = [] } = await context.params;
  // Teaserbilder für ICONY ohne Dateiendung (lib/teaser-image.ts)
  if (isTeaserImageRoute(route)) return teaserImageResponse(route, request.method);
  // CH: eigene Artikel; AT: Städte-Teaser. Der Proxy überschreibt diesen Header für jeden REST-Aufruf.
  const params = new URL(request.url).searchParams;
  const market = request.headers.get("x-tv-rest-market");
  if (market) params.set(MARKET_TEASER_PARAM, market);
  const source = marketTeaserSourceFor(params);
  return wpRestResponse(handleWpRest(`/${route.join("/")}`, params, source), request.method);
}

export const HEAD = GET;

export function OPTIONS() {
  return wpRestPreflight();
}
