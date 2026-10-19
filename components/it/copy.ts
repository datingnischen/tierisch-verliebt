import type { GuideAnimal, GuideTopic } from "@/lib/city-guide";

export const ANIMAL_LABELS: Record<GuideAnimal, string> = {
  hund: "Cani", katze: "Gatti", pferd: "Cavalli", kleintier: "Piccoli animali", vogel: "Uccelli",
};

export const TOPIC_LABELS: Record<GuideTopic, string> = {
  walk: "Passeggiate con il cane", food: "Un caffè insieme", stay: "Pernottare con l'animale",
  cat: "Per chi ama i gatti", vet: "Regole e servizi", groom: "Toelettatura", school: "Educazione cinofila",
  trip: "Gite", love: "Amore e animali", paw: "In giro con l'animale",
};

/** Logo der Schweizer Plattform (ICONY), die italienische Variante gehört zu tierisch-verliebt.ch. */
export const CH_LOGO = "https://static2.icony-hosting.de/dyncontent36672bdefe632c6e08d5c1e307546c4d/img/tierischverliebtch/logo.svg";
