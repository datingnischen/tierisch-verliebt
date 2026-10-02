/**
 * Reine Pfad-Logik für den WordPress-kompatiblen REST-Endpunkt (siehe lib/wp-rest-compat.ts).
 * Bewusst ohne Imports, weil proxy.ts sie im Edge-Runtime lädt.
 *
 * Das frühere WordPress lag unter /magazin/. Dieselben Adressen antworten weiter:
 *   /magazin/wp-json/wp/v2/posts           (Länderpräfix /de, /at, /ch ist optional)
 *   /magazin/index.php?rest_route=/wp/v2/posts
 *   /magazin/?rest_route=/wp/v2/posts
 */

const MARKET_PREFIX = /^\/(?:de|at|ch)(?=\/|$)/;
const REST_PATH = /^\/magazin\/(?:wp-json(?:\/|$)|index\.php\/?$)/;
const MAGAZINE_ROOT = /^\/magazin\/?$/;

const withoutMarket = (pathname: string) => pathname.replace(MARKET_PREFIX, "") || "/";

/** Pfad eines REST-Endpunkts (wp-json oder index.php), mit oder ohne Länderpräfix. */
export function isWpRestPath(pathname: string): boolean {
  return REST_PATH.test(withoutMarket(pathname));
}

/** /magazin/?rest_route=… (WordPress ohne schöne Permalinks): Ziel ist die index.php-Route. */
export function isWpRestRoot(pathname: string, search: URLSearchParams): boolean {
  return search.has("rest_route") && MAGAZINE_ROOT.test(withoutMarket(pathname));
}
