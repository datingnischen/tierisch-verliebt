import { handleRestRouteQuery, wpRestPreflight } from "@/lib/wp-rest-compat";

// Alte WordPress-Schreibweise ohne schöne Permalinks: /magazin/index.php?rest_route=/wp/v2/posts
// (proxy.ts leitet auch /magazin/?rest_route=… hierher). Ohne rest_route geht es ins Magazin.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleRestRouteQuery(request.url, request.method, "/magazin/");
}

export const HEAD = GET;

export function OPTIONS() {
  return wpRestPreflight();
}
