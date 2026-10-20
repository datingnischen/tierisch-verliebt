import type { GuideAnimal, GuideTopic } from "@/lib/city-guide";
import { staticAsset } from "@/lib/static-asset";

export const ANIMAL_LABELS: Record<GuideAnimal, string> = {
  hund: "Cani", katze: "Gatti", pferd: "Cavalli", kleintier: "Piccoli animali", vogel: "Uccelli",
};

export const TOPIC_LABELS: Record<GuideTopic, string> = {
  walk: "Passeggiate con il cane", food: "Un caffè insieme", stay: "Pernottare con l'animale",
  cat: "Per chi ama i gatti", vet: "Regole e servizi", groom: "Toelettatura", school: "Educazione cinofila",
  trip: "Gite", love: "Amore e animali", paw: "In giro con l'animale",
};

/** Logo der Schweizer Plattform (Kopie im Repo, nicht vom ICONY-CMS), die italienische Variante gehört zu tierisch-verliebt.ch. */
export const CH_LOGO = staticAsset("/brand/tierisch-verliebt-logo-ch.svg");
