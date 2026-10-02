import { handleWpRest, wpRestPreflight, wpRestResponse } from "@/lib/wp-rest-compat";

// WordPress-kompatibler REST-Endpunkt (aus den Magazin-Dateien erzeugt), siehe lib/wp-rest-compat.ts.
// Die URL bleibt wie im früheren WordPress: https://tierisch-verliebt.de/magazin/wp-json/wp/v2/posts
// (proxy.ts nimmt sie von der Slash-Umleitung aus; auf Vorschau-Hosts auch unter /de/magazin/wp-json/…).
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ route?: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  const { route = [] } = await context.params;
  return wpRestResponse(handleWpRest(`/${route.join("/")}`, new URL(request.url).searchParams), request.method);
}

export const HEAD = GET;

export function OPTIONS() {
  return wpRestPreflight();
}
