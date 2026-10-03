import type { GuideAnimal, GuideTopic } from "@/lib/city-guide";

export const ANIMAL_LABELS: Record<GuideAnimal, string> = {
  hund: "Honden", katze: "Katten", pferd: "Paarden", kleintier: "Kleine huisdieren", vogel: "Vogels",
};
export const TOPIC_LABELS: Record<GuideTopic, string> = {
  walk: "Wandelen met je hond", food: "Samen naar een café", stay: "Overnachten met je huisdier",
  cat: "Voor kattenliefhebbers", vet: "Dierenzorg", groom: "Vachtverzorging", school: "Hondenscholen",
  trip: "Uitstapjes", love: "Dierenliefde & dating", paw: "Op pad met je huisdier",
};
