export type Tierwelt = {
  slug: string;
  name: string;
  tagline: string;
  teaser: string;
  traits: string[];
  cta: string;
  domains: string[];
};

export type TierweltGroup = {
  id: string;
  emoji: string;
  name: string;
  claim: string;
  intro: string;
  category?: { slug: string; label: string };
  worlds: Tierwelt[];
};

export const TIERWELT_GROUPS: TierweltGroup[] = [
  {
    id: "katzenwelten",
    emoji: "🐱",
    name: "Katzenwelten",
    claim: "Für Menschen, die sich ihr Zuhause mit einer Katze teilen – oder teilen wollen.",
    intro:
      "Ob majestätische Langhaarkatze, verschmuster Riese oder kleiner Wirbelwind mit Leopardenmuster: Jede Rasse hat ihren eigenen Charakter – und ihre eigenen Fans. Hier findest du Rasseporträts mit Wesen, Pflege und Haltung und triffst Menschen, die genau diese Katze lieben.",
    category: { slug: "ratgeber-katze", label: "Ratgeber Katze" },
    worlds: [
      {
        slug: "perserkatze",
        name: "Perserkatzen",
        tagline: "Die edle Langhaar-Diva",
        teaser: "Ruhig, anhänglich und mit prachtvollem Fell – für alle, die Gelassenheit und Fellpflege-Rituale lieben.",
        traits: ["ruhig", "verschmust", "pflegeintensiv"],
        cta: "Perserkatzen entdecken",
        domains: ["perser-katze.de", "perserkatzen.de"],
      },
      {
        slug: "ragdoll",
        name: "Ragdoll",
        tagline: "Das blauäugige Schmusekissen",
        teaser: "Sanft, menschenbezogen und familienfreundlich – eine Katze, die sich am liebsten auf deinen Arm legt.",
        traits: ["sanft", "familienfreundlich", "menschenbezogen"],
        cta: "Ragdolls entdecken",
        domains: ["ragdoll.de"],
      },
      {
        slug: "maine-coon",
        name: "Maine Coon",
        tagline: "Der sanfte Riese",
        teaser: "Groß, freundlich und verspielt bis ins hohe Alter – der Charakterkopf unter den Rassekatzen.",
        traits: ["groß", "gesellig", "verspielt"],
        cta: "Maine Coons entdecken",
        domains: ["mainecoonkatze.de", "mainecoonkatzen.de", "mainecoonkatzen.at"],
      },
      {
        slug: "bengal-katze",
        name: "Bengalkatzen",
        tagline: "Wildes Fell, wacher Kopf",
        teaser: "Aktiv, neugierig und mit Leopardenoptik – ideal für alle, die Beschäftigung und Temperament mögen.",
        traits: ["aktiv", "intelligent", "wild im Look"],
        cta: "Bengalkatzen entdecken",
        domains: ["bengal-katzen.de"],
      },
      {
        slug: "tuerkische-angora",
        name: "Türkische Angora",
        tagline: "Elegante Seidenschönheit",
        teaser: "Anmutig, feinfühlig und mit seidig langem Fell – eine der ältesten Langhaarrassen der Welt.",
        traits: ["elegant", "lebhaft", "feinfühlig"],
        cta: "Angorakatzen entdecken",
        domains: ["angora-katze.de"],
      },
      {
        slug: "wildkatze",
        name: "Wildkatzen",
        tagline: "Scheu, selten, faszinierend",
        teaser: "Von der Europäischen Wildkatze bis zu exotischen Arten – für alle, die Katzen in freier Natur begeistern.",
        traits: ["Natur", "Artenschutz", "Lebensraum"],
        cta: "Wildkatzen entdecken",
        domains: ["wildkatze.ch"],
      },
    ],
  },
  {
    id: "hundewelten",
    emoji: "🐶",
    name: "Hundewelten",
    claim: "Für alle, deren Tag mit Gassigehen beginnt.",
    intro:
      "Mit Hund ist Partnersuche anders: Das Gegenüber muss nicht nur zu dir passen, sondern auch zu deinem Vierbeiner. In der Hundewelt geht es um Rassen, Alltag und Erziehung – und um Menschen, die verstehen, warum der Hund beim ersten Date mit darf.",
    category: { slug: "ratgeber-hund", label: "Ratgeber Hund" },
    worlds: [
      {
        slug: "havaneser",
        name: "Havaneser",
        tagline: "Der fröhliche Familienhund",
        teaser: "Klein, lustig und unkompliziert – ein Begleiter für Stadt, Familie und gemeinsame Spaziergänge zu zweit.",
        traits: ["fröhlich", "anhänglich", "stadttauglich"],
        cta: "Havaneser entdecken",
        domains: ["havaneser-hunde.de"],
      },
    ],
  },
  {
    id: "voegel",
    emoji: "🐦",
    name: "Vögel & Papageien",
    claim: "Für alle, bei denen es zu Hause zwitschert.",
    intro:
      "Vögel sind gesellig, klug und alles andere als pflegeleichte Deko. Hier erfährst du, welche Arten zu dir passen, wie artgerechte Haltung gelingt – und triffst andere, die ihr Leben mit gefiederten Mitbewohnern teilen.",
    category: { slug: "ratgeber-voegel", label: "Ratgeber Vögel" },
    worlds: [
      {
        slug: "voegel-als-haustiere",
        name: "Vögel als Haustiere",
        tagline: "Welcher Vogel passt zu mir?",
        teaser: "Wellensittich, Kanarienvogel oder Papagei? Der Überblick für alle, die über gefiederte Mitbewohner nachdenken.",
        traits: ["Einstieg", "Artenwahl", "Tipps"],
        cta: "Vogelwelt entdecken",
        domains: [],
      },
      {
        slug: "voegel-richtig-halten",
        name: "Vögel richtig halten",
        tagline: "Artgerecht von Anfang an",
        teaser: "Käfig, Freiflug, Futter und Gesellschaft – das Wichtigste für eine glückliche Vogelhaltung.",
        traits: ["Haltung", "Ernährung", "Freiflug"],
        cta: "Haltungs-Ratgeber lesen",
        domains: [],
      },
    ],
  },
  {
    id: "pferdewelten",
    emoji: "🐴",
    name: "Reiter & Pferdefreunde",
    claim: "Für alle, deren Wochenende im Stall stattfindet.",
    intro:
      "Stallzeit, Turniere, Ausritte im Morgennebel: Wer reitet, braucht einen Partner, der diese Leidenschaft versteht – oder sie teilt. Die Reiterwelt bringt Pferdemenschen zusammen.",
    worlds: [
      {
        slug: "reiter-partnersuche",
        name: "Reiter-Singles",
        tagline: "Liebe mit Stallgeruch",
        teaser: "Partnersuche für Reiterinnen, Reiter und Pferdefreunde – mit Tipps, wie Stall und Beziehung zusammenpassen.",
        traits: ["Reitsport", "Stallalltag", "Partnersuche"],
        cta: "Reiterwelt besuchen",
        domains: ["reitersingles.de"],
      },
    ],
  },
];

export const TIERWELT_MATCHES = [
  { emoji: "🛋️", need: "Du liebst ruhige Abende und Kuscheln auf dem Sofa", slugs: ["perserkatze", "ragdoll"] },
  { emoji: "⚡", need: "Du willst ein Tier mit Temperament und Köpfchen", slugs: ["bengal-katze", "tuerkische-angora"] },
  { emoji: "👨‍👩‍👧", need: "Du suchst einen unkomplizierten Begleiter für Familie und Stadt", slugs: ["havaneser", "maine-coon"] },
  { emoji: "🌿", need: "Dich zieht es raus in die Natur", slugs: ["wildkatze", "reiter-partnersuche"] },
  { emoji: "🎶", need: "Bei dir darf es gern zwitschern", slugs: ["voegel-als-haustiere", "voegel-richtig-halten"] },
];

export const TIERWELT_FAQ = [
  {
    question: "Was ist eine Tierwelt auf tierisch-verliebt.de?",
    answer:
      "Eine Tierwelt bündelt alles zu einer Tierart oder Rasse: Porträts, Haltungstipps und Hintergründe aus dem Magazin – und den direkten Weg zu Singles, die dieselbe Tierliebe teilen.",
  },
  {
    question: "Kostet die Nutzung der Tierwelten etwas?",
    answer:
      "Nein. Alle Magazin-Inhalte der Tierwelten sind frei lesbar, und die Anmeldung bei tierisch-verliebt.de ist kostenlos.",
  },
  {
    question: "Muss ich selbst ein Tier haben, um mitzumachen?",
    answer:
      "Nein. Viele Mitglieder haben ein Haustier, andere wünschen sich eines oder lieben Tiere einfach. Entscheidend ist, dass Tiere in deinem Leben einen festen Platz haben sollen.",
  },
  {
    question: "Warum führen Adressen wie ragdoll.de oder reitersingles.de hierher?",
    answer:
      "Das sind thematische Einstiegsadressen unseres Netzwerks. Sie führen direkt in die passende Tierwelt; Inhalte und Community liegen zentral auf tierisch-verliebt.de.",
  },
  {
    question: "Kommen weitere Tierwelten dazu?",
    answer:
      "Ja. Das Magazin wächst laufend, und neue Rassen und Tierarten kommen nach und nach als eigene Tierwelt dazu.",
  },
];

export const TIERWELT_COUNT = TIERWELT_GROUPS.reduce((sum, group) => sum + group.worlds.length, 0);

export function findTierwelt(slug: string) {
  for (const group of TIERWELT_GROUPS) {
    const world = group.worlds.find((entry) => entry.slug === slug);
    if (world) return { group, world };
  }
  return null;
}
