export type MagazineAnimal = "katze" | "hund" | "vogel" | "pferd" | "allgemein";

type AnimalInput = {
  /** Gruppen-ID aus lib/tierwelten.ts, falls die Seite dort zugeordnet ist. */
  tierweltGroupId?: string;
  title: string;
  content: string;
  categorySlugs?: string[];
};

const GROUP_ANIMALS: Record<string, MagazineAnimal> = {
  katzenwelten: "katze",
  hundewelten: "hund",
  voegel: "vogel",
  pferdewelten: "pferd",
};

const CATEGORY_ANIMALS: Record<string, MagazineAnimal> = {
  "ratgeber-katze": "katze",
  "ratgeber-hund": "hund",
  "ratgeber-voegel": "vogel",
};

const ANIMAL_PATTERNS: [MagazineAnimal, RegExp][] = [
  ["katze", /katze|kater\b|kätzchen|kitten/gi],
  ["hund", /\bhund(?!ert)|welpe/gi],
  ["vogel", /vogel|vögel|papagei|sittich|kanarien/gi],
  ["pferd", /pferd|reiter|\breiten\b|pony/gi],
];

function countMatches(text: string, pattern: RegExp) {
  return text.match(pattern)?.length ?? 0;
}

/**
 * Ermittelt, um welches Tier es auf einer Magazinseite geht – für eine
 * passende Sidebar. Reihenfolge: Tierwelten-Zuordnung, WP-Kategorie,
 * Titel, dann das im Inhalt klar dominierende Tier.
 */
export function detectMagazineAnimal({ tierweltGroupId, title, content, categorySlugs = [] }: AnimalInput): MagazineAnimal {
  if (tierweltGroupId && GROUP_ANIMALS[tierweltGroupId]) return GROUP_ANIMALS[tierweltGroupId];

  for (const category of categorySlugs) {
    if (CATEGORY_ANIMALS[category]) return CATEGORY_ANIMALS[category];
  }

  const titleHits = ANIMAL_PATTERNS.filter(([, pattern]) => countMatches(title, pattern) > 0);
  if (titleHits.length === 1) return titleHits[0][0];

  const text = content.replace(/<[^>]+>/g, " ");
  const scores = ANIMAL_PATTERNS.map(([animal, pattern]) => ({ animal, count: countMatches(text, pattern) })).sort(
    (a, b) => b.count - a.count,
  );
  const [top, second] = scores;
  if (top.count >= 3 && top.count >= second.count * 2) return top.animal;

  return "allgemein";
}

export type MagazineSidebarVariant = {
  /** Pfad unter public/ – fehlt er, wird das Standardbild (Paar mit Hund) genutzt. */
  image?: string;
  imageAlt: string;
  audience: string;
  /** Eigene CTA-Texte je Tier; fehlen sie, gelten die allgemeinen aus MAGAZINE_CTA_DEFAULT. */
  cta?: Partial<MagazineCtaTexts>;
};

export type MagazineCtaTexts = {
  /** Button im Artikel-Hero */
  hero: string;
  railEyebrow: string;
  railTitle: string;
  railPoints: [string, string, string];
  railButton: string;
  reasons: { icon: string; strong: string; text: string }[];
  reasonsButton: string;
};

export const MAGAZINE_CTA_DEFAULT: MagazineCtaTexts = {
  hero: "Kostenlos registrieren",
  railEyebrow: "Singlebörse",
  railTitle: "Tierliebe Singles statt nur weiterlesen",
  railPoints: ["Kostenlos starten", "Tierliebe Singles", "Direkter Einstieg"],
  railButton: "Kostenlos registrieren",
  reasons: [
    { icon: "🐾", strong: "Echte Tierliebe", text: "statt austauschbarer Flirts" },
    { icon: "📖", strong: "Direkter Einstieg", text: "aus Magazin, Tierwelt und Ratgeber" },
    { icon: "💚", strong: "Kostenlos starten", text: "und passende Kontakte entdecken" },
  ],
  reasonsButton: "Jetzt Singles entdecken",
};

export const MAGAZINE_SIDEBAR_DEFAULT_IMAGE = "/home/frontpage-visual-tierischverliebt.webp";

export const MAGAZINE_SIDEBAR_VARIANTS: Record<MagazineAnimal, MagazineSidebarVariant> = {
  katze: {
    // Quelle: Pexels, Foto 8359643 von Vlada Karpovich – siehe docs/bildquellen/README.md
    image: "/home/sidebar-paar-katze.webp",
    imageAlt: "Tierisch verliebt – Singles mit Katzenliebe kennenlernen",
    audience: "Menschen mit derselben Liebe zu Katzen",
  },
  hund: {
    image: MAGAZINE_SIDEBAR_DEFAULT_IMAGE,
    imageAlt: "Tierisch verliebt – Singles mit Hund kennenlernen",
    audience: "Menschen mit derselben Liebe zu Hunden",
  },
  vogel: {
    imageAlt: "Tierisch verliebt – Singles mit Vogelliebe kennenlernen",
    audience: "Menschen mit derselben Liebe zu Vögeln",
  },
  pferd: {
    // Zuschnitt des Titelbilds aus /magazin/reiter-partnersuche/ – siehe docs/bildquellen/README.md
    image: "/home/sidebar-paar-pferd.webp",
    imageAlt: "Paar mit Pferd am Koppelzaun – Reiter-Singles auf tierisch-verliebt.de kennenlernen",
    audience: "jemanden, der Stallzeiten, Turniertage und Pferdeliebe genauso versteht wie du",
    cta: {
      hero: "Kostenlos Reiter-Singles finden",
      railEyebrow: "Reiter-Singles",
      railTitle: "Aufsatteln statt nur weiterlesen",
      railPoints: ["Kostenlos starten", "Pferdemenschen in deiner Nähe", "Stallzeiten? Verständnis inklusive"],
      railButton: "Jetzt kostenlos aufsatteln",
      reasons: [
        { icon: "🐴", strong: "Pferdeliebe", text: "statt Erklärungen, warum du schon wieder im Stall bist" },
        { icon: "🌾", strong: "Gemeinsame Welt", text: "von Ausritt bis Turnierwochenende" },
        { icon: "💚", strong: "Kostenlos starten", text: "und Reiterinnen und Reiter entdecken" },
      ],
      reasonsButton: "Pferdefreunde kennenlernen",
    },
  },
  allgemein: {
    image: MAGAZINE_SIDEBAR_DEFAULT_IMAGE,
    imageAlt: "Tierisch verliebt – tierliebe Singles kennenlernen",
    audience: "Menschen mit derselben Liebe zu Hund, Katze und Co.",
  },
};

export type ResolvedMagazineSidebarVariant = Required<Omit<MagazineSidebarVariant, "cta">> & { cta: MagazineCtaTexts };

export function getMagazineSidebarVariant(animal: MagazineAnimal): ResolvedMagazineSidebarVariant {
  const variant = MAGAZINE_SIDEBAR_VARIANTS[animal];
  return {
    ...variant,
    image: variant.image ?? MAGAZINE_SIDEBAR_DEFAULT_IMAGE,
    cta: { ...MAGAZINE_CTA_DEFAULT, ...variant.cta },
  };
}
