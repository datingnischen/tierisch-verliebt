import { handleRestRouteQuery, wpRestPreflight } from "@/lib/wp-rest-compat";
import { marketTeaserSourceFor } from "@/lib/wp-market-teasers";

// Alte WordPress-Schreibweise ohne schöne Permalinks: /magazin/index.php?rest_route=/wp/v2/posts
// (proxy.ts leitet auch /magazin/?rest_route=… hierher). Ohne rest_route geht es ins Magazin.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  // Länderknoten .at/.ch (proxy.ts setzt tv_market), siehe lib/wp-market-teasers.ts.
  const url = new URL(request.url);
  const source = marketTeaserSourceFor(url.searchParams);
  return handleRestRouteQuery(url.href, request.method, "/magazin/", source);
}

export const HEAD = GET;

export function OPTIONS() {
  return wpRestPreflight();
}
