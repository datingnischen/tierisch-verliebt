/** Italienischer Pilot unter tierisch-verliebt.ch/it/: Startseite und Stadtseiten. ICONY-Pfade bleiben extern. */
export const IT_CITIES = [
  { slug: "lugano", name: "Lugano" },
  { slug: "bellinzona", name: "Bellinzona" },
  { slug: "locarno", name: "Locarno" },
  { slug: "mendrisio", name: "Mendrisio" },
  { slug: "chiasso", name: "Chiasso" },
] as const;
export const IT_CITY_SLUGS = IT_CITIES.map((city) => city.slug);

/**
 * Indexierung erst freigeben, wenn ICONY die italienische Registrierung ausliefert und der Pilot laufen soll.
 * Bis dahin noindex und nicht in der Sitemap, wie beim NL-Pilot.
 */
export const IT_PILOT_INDEXABLE = false;

/** Pfad ohne /it-Präfix, z. B. "/" oder "/lugano". */
export function isItEditorialPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/" || IT_CITY_SLUGS.some((slug) => path === `/${slug}`);
}

/**
 * Profile und Suche kommen aus der Schweizer ICONY-Plattform (gleiche Mitglieder wie .ch).
 * Registrierung und Login bleiben auf tierisch-verliebt.ch, bis ICONY die italienische Oberfläche ausliefert;
 * dann nur diese Adressen umstellen.
 */
export const IT_PLATFORM = {
  registrationUrl: "https://tierisch-verliebt.ch/registration/?AID=location",
  searchUrl: "https://tierisch-verliebt.ch/suche/?AID=location",
  loginUrl: "https://tierisch-verliebt.ch/login/",
} as const;
