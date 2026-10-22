/** Public editorial routes in the Dutch pilot; ICONY platform paths remain external. */
export const NL_BREEDS = [
  { slug: "labrador-retriever", sourceSlug: "labrador-retriever", name: "Labrador Retriever", animal: "dog" },
  { slug: "golden-retriever", sourceSlug: "golden-retriever", name: "Golden Retriever", animal: "dog" },
  { slug: "franse-bulldog", sourceSlug: "franzoesische-bulldogge", name: "Franse Bulldog", animal: "dog" },
  { slug: "duitse-herder", sourceSlug: "deutscher-schaeferhund", name: "Duitse Herder", animal: "dog" },
  { slug: "poedel", sourceSlug: "pudel", name: "Poedel", animal: "dog" },
  { slug: "brits-korthaar", sourceSlug: "britisch-kurzhaar", name: "Brits Korthaar", animal: "cat" },
  { slug: "maine-coon", sourceSlug: "maine-coon", name: "Maine Coon", animal: "cat" },
  { slug: "ragdoll", sourceSlug: "ragdoll", name: "Ragdoll", animal: "cat" },
  { slug: "siamees", sourceSlug: "siamkatze", name: "Siamees", animal: "cat" },
  { slug: "bengaal", sourceSlug: "bengal-katze", name: "Bengaal", animal: "cat" },
] as const;

/**
 * Indexierung erst freigeben, wenn tierisch-verliebt.nl registriert ist und auf Vercel zeigt (Canonicals
 * zeigen schon dorthin). Dann: indexierbar, NL-Sitemap mit allen Seiten, robots erlaubt.
 */
export const NL_PILOT_INDEXABLE = false;

/** NL-Link in den Live-Footern DE/AT/CH: unabhängig von der Indexierung, nur nach Christians ausdrücklicher Freigabe. */
export const NL_IN_LIVE_FOOTERS = false;

/** Over ons ist indexierbar; Privacy und Colofon bleiben immer noindex. */
export const NL_INFO_PAGES = ["over-ons", "privacy", "colofon"] as const;
export type NlInfoPage = (typeof NL_INFO_PAGES)[number];
export const NL_LEGAL_PAGES: readonly NlInfoPage[] = ["privacy", "colofon"];

/**
 * Eine niederländische ICONY-Plattform gibt es noch nicht. Bis dahin führen Aanmelden und Inloggen auf die
 * deutschsprachige Plattform tierisch-verliebt.de, die Seiten sagen das per Hinweis. Sobald ICONY eine
 * niederländische Oberfläche liefert: nur diese Adressen umstellen und NL_PLATFORM_DUTCH auf true setzen.
 */
export const NL_PLATFORM_DUTCH = false;
export const NL_PLATFORM = {
  origin: "https://tierisch-verliebt.de",
  host: "tierisch-verliebt.de",
  loginUrl: "https://tierisch-verliebt.de/login/",
  searchUrl: "https://tierisch-verliebt.de/suche/?AID=location",
} as const;

export function nlRegistrationUrl(aid: "location" | "magazin" = "location"): string {
  return `${NL_PLATFORM.origin}/registration/?AID=${aid}`;
}

/** Pfade der NL-Sitemap: leer bis zur Freigabe, danach alle Seiten außer Privacy, Colofon und /partnersuche (Canonical = Startseite). */
export function nlSitemapPaths(citySlugs: readonly string[]): string[] {
  if (!NL_PILOT_INDEXABLE) return [];
  return ["/", ...citySlugs.map((slug) => `/partnersuche/${slug}`),
    "/magazin", "/magazin/hondenrassen", "/magazin/kattenrassen", ...NL_BREEDS.map((breed) => `/magazin/${breed.slug}`), "/over-ons"];
}

export function isNlEditorialPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/" || /^\/partnersuche(?:\/[a-z0-9-]+)?$/.test(path)
    || ["/magazin", "/magazin/hondenrassen", "/magazin/kattenrassen"].includes(path)
    || NL_BREEDS.some((breed) => path === `/magazin/${breed.slug}`)
    || NL_INFO_PAGES.some((page) => path === `/${page}`);
}
