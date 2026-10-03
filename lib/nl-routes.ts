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

export function isNlEditorialPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/" || /^\/partnersuche(?:\/[a-z0-9-]+)?$/.test(path)
    || ["/magazin", "/magazin/hondenrassen", "/magazin/kattenrassen"].includes(path)
    || NL_BREEDS.some((breed) => path === `/magazin/${breed.slug}`);
}
