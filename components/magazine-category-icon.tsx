import { BirdIcon, BunnyIcon, CatIcon, DogIcon, HeartIcon, HorseIcon, PawIcon } from "@/components/city-page/tier-icons";

/** Tiersymbol für eine Magazin-Kategorie (Ratgeber Hund → Hund usw.), sonst Pfote. */
export function MagazineCategoryIcon({ slug }: { slug: string }) {
  if (slug.includes("hund")) return <DogIcon />;
  if (slug.includes("katze")) return <CatIcon />;
  if (slug.includes("vogel") || slug.includes("voegel")) return <BirdIcon />;
  if (slug.includes("klein") || slug.includes("kaninchen")) return <BunnyIcon />;
  if (slug.includes("pferd")) return <HorseIcon />;
  if (slug.includes("allgemein") || slug.includes("dating")) return <HeartIcon />;
  return <PawIcon />;
}
