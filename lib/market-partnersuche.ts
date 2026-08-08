import data from "../data/partnersuche-markets.json" with { type: "json" };
import type { MarketCode } from "./markets.ts";

export type MarketCityPage = {
  market: MarketCode;
  slug: string;
  path: string;
  sourceUrl: string;
  title: string;
  description: string;
  cityName: string;
  lead: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  contentHtml: string;
  sourceAttributionUrl?: string | null;
  registrationUrl: string;
  searchUrl: string;
  icony: {
    platformId: string;
    zip: string;
    country: number;
    frameUrl: string;
  };
};

export type MarketHubSection = {
  heading: string;
  paragraphs: string[];
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export type MarketHubEditorial = {
  heroImageUrl?: string | null;
  heroImageAlt?: string | null;
  introParagraphs: string[];
  sections: MarketHubSection[];
};

type RawMarket = {
  market: MarketCode;
  title: string;
  description: string;
  pages: MarketCityPage[];
};

type HubCopy = {
  title: string;
  description: string;
  editorial: MarketHubEditorial;
};

const imports = data as Record<MarketCode, RawMarket>;

const HUB_COPY: Record<MarketCode, HubCopy> = {
  de: {
    title: "Finde tierliebe Singles aus deiner Region",
    description: "Wähle deine Stadt und entdecke tierliebe Singles, lokale Treffpunkte und hilfreiche Tipps für einen entspannten Einstieg.",
    editorial: {
      heroImageUrl:
        "https://static-cms.icony-hosting.de/cms/75D08CAE0856CA78597236DA7F19D9C1E4E994C46AA6489BD4C63826D5115870/1000/tierisch-de-partnersuche.jpg",
      heroImageAlt: "Partnersuche für Tierfreunde in Deutschland",
      introParagraphs: [
        "Willkommen bei tierisch-verliebt.de – deiner Anlaufstelle für Singles, die ihre Liebe zu Tieren teilen. Wenn du auf der Suche nach einem Partner bist, der deine Leidenschaft für Tiere teilt, bist du bei uns genau richtig. Unsere Plattform bringt tierliebe Menschen zusammen, die mehr als nur eine gemeinsame Leidenschaft suchen.",
        "Unsere regionale Partnersuche ermöglicht es dir, gezielt nach tierlieben Singles in deiner Stadt oder Region zu suchen. Durchsuche die Profile, entdecke interessante Persönlichkeiten und finde jemanden, der dein Herz und deine Liebe zu Tieren teilt. Egal ob du nach einer ernsthaften Beziehung oder neuen Freundschaften suchst – bei uns findest du die passenden Kontakte.",
        "Wir haben eine umfangreiche Liste mit Städten in ganz Deutschland zusammengestellt, um dir die Suche zu erleichtern. Wähle einfach deine Stadt aus dieser Liste und sieh dir an, welche tierlieben Singles in deiner Nähe sind. So findest du schnell und unkompliziert Menschen, die deine Interessen und Werte teilen.",
        "Starte noch heute deine Suche und entdecke die Vielfalt der tierlieben Community. Vielleicht wartet dein nächstes großes Abenteuer oder die Liebe deines Lebens nur ein paar Klicks entfernt.",
      ],
      sections: [],
    },
  },
  at: {
    title: "Tierliebe Partnersuche in Österreich",
    description: "Entdecke tierliebe Singles und regionale Tipps in 15 österreichischen Städten – von Wien und Graz bis Bregenz und Eisenstadt.",
    editorial: {
      heroImageUrl:
        "https://static-cms.icony-hosting.de/cms/E809EBFBFA864125E7101AEB73EB50425F0461196A297D9FFFD4D82726A88CFE/1000/tierisch-at-partnersuche.jpg",
      heroImageAlt: "Partnersuche für Tierfreunde in Österreich",
      introParagraphs: [
        "Du bist Single, liebst Tiere und suchst nach Gleichgesinnten, mit denen du schöne Stunden verbringen kannst – am besten gemeinsam mit deinem Hund, deiner Katze oder einfach mit Tierliebe im Herzen? Dann bist du bei tierisch-verliebt.at genau richtig. Wir zeigen dir, wo Dating mit tierischem Bezug in deiner Stadt oder Region besonders gut funktioniert.",
        "Hier findest du eine Übersicht aller Städte in Österreich, für die wir besondere Tipps, Parks, Cafés und Locations für tierliebe Singles zusammengestellt haben:",
        "Ganz egal, ob du in einer großen Stadt wie Wien wohnst oder in einer kleineren Gemeinde – wir möchten dir zeigen, wo du nicht nur neue Kontakte knüpfen, sondern dich vielleicht auch richtig verlieben kannst.",
      ],
      sections: [
        {
          heading: "Warum Dating mit Tieren oft besser funktioniert",
          imageUrl:
            "https://static-cms.icony-hosting.de/cms/7A958FDE538DEF0EAA89FC110B6F9D1E060A50BA3C8BF3CD7E06F2B79BB48875/1000/tierisch-verliebt-at-(1).jpg",
          imageAlt: "Dating mit Hund und Tierliebe in Österreich",
          paragraphs: [
            "Tiere sind ehrliche Wesen – sie zeigen uns bedingungslose Zuneigung, sind treue Begleiter und bringen Ruhe in unseren oft hektischen Alltag. Wer mit Tieren lebt, hat meist gelernt, Rücksicht zu nehmen, Verantwortung zu tragen und echte Nähe zuzulassen. Eigenschaften, die auch in einer Partnerschaft wertvoll sind.",
            "Beim Dating mit Tierfreunden spielt Oberflächlichkeit oft eine kleinere Rolle. Stattdessen zählt, was im Herzen wichtig ist: gemeinsame Werte, Tierliebe und eine ähnliche Lebensweise. Das schafft eine ehrliche Basis für tiefere Verbindungen – oft schneller, als man denkt.",
          ],
        },
        {
          heading: "Nicht nur für Hundebesitzer – tierisch verliebt heißt für alle",
          paragraphs: [
            "Auch wenn Gassi-Dates oft im Fokus stehen, ist tierisch-verliebt.at viel mehr als nur eine Plattform für Hundemenschen. Wir richten uns an alle, die Tiere lieben – egal ob du Katzenflüsterer, Pferdemensch, Aquarien-Fan oder überzeugter Tierfreund ohne eigenes Haustier bist.",
            "Die Liebe zum Tier ist der gemeinsame Nenner, nicht die Tierart. Denn was wirklich zählt, ist das Verständnis für eine tierfreundliche Lebensweise und der Wunsch, diese mit einem liebevollen Menschen zu teilen. So entstehen Beziehungen mit Herz – und ganz viel Verständnis füreinander.",
          ],
        },
        {
          heading: "Unser Versprechen: Liebe mit Herz und Pfote",
          imageUrl:
            "https://static-cms.icony-hosting.de/cms/FE7A88F29A7F1DE6C5213BCEAA9D14C7C092941BF7AA96F1C9FB663039052E1F/1000/tierisch-verliebt-at-(2).jpg",
          imageAlt: "Tierliebe Begegnung in Österreich",
          paragraphs: [
            "Bei tierisch-verliebt.at steht echte Verbindung im Mittelpunkt. Wir glauben daran, dass Partnerschaft mehr ist als ein Algorithmus – sie beginnt oft mit einem Lächeln, einem tierischen Funken oder dem Gefühl, verstanden zu werden. Unsere Plattform bringt genau diese Menschen zusammen.",
            "Jeder, der sich auf tierisch-verliebt.at anmeldet, teilt eine Leidenschaft: die Liebe zu Tieren. Das sorgt für eine besondere Atmosphäre, in der Ehrlichkeit, Achtsamkeit und Respekt selbstverständlich sind. Hier darf man so sein, wie man ist – mit Herz, Pfote und einem offenen Blick fürs Leben.",
          ],
        },
      ],
    },
  },
  ch: {
    title: "Tierliebe Partnersuche in der Schweiz",
    description: "Entdecke tierliebe Singles und regionale Tipps in 15 Schweizer Städten – von Zürich und Bern bis Genf, Chur und Aarau.",
    editorial: {
      heroImageUrl:
        "https://static-cms.icony-hosting.de/cms/5BA07DAF93245C2C145137C1977BDBFA13787F3628246FC95A0DE52450366E3F/1000/tierish-ch-partnersuche.jpg",
      heroImageAlt: "Partnersuche für Tierfreunde in der Schweiz",
      introParagraphs: [
        "Die Liebe ist schon kompliziert genug – noch schwieriger wird’s, wenn man Haustiere hat und den oder die Richtige sucht, der oder die dieselbe Leidenschaft für Tiere teilt. Genau dafür gibt es Tierisch Verliebt CH: Wir bringen Singles mit Herz für Fellnasen, Federvieh und Co. zusammen. In vielen Schweizer Städten haben wir bereits Artikel mit Tipps, Inspirationen und Möglichkeiten zur Partnersuche speziell für Tierfreunde veröffentlicht.",
        "Unsere Stadt-Guides geben dir einen Überblick über die besten Orte, Events und Plattformen in deiner Region – immer mit dem Fokus auf tierliebe Singles. Egal ob du gerade erst auf der Suche bist oder neue Ideen brauchst, um Gleichgesinnte kennenzulernen: Bei uns findest du hilfreiche Tipps für eine partnerschaftliche Zukunft mit Pfotenabdruck.",
        "Hier findest du unsere Tipps zur Partnersuche für Tierfreunde in diesen Städten:",
        "Du vermisst deine Stadt? Kein Problem – wir erweitern unsere Inhalte regelmäßig. Schau also bald wieder vorbei oder schreib uns, wenn du dir Tipps für eine bestimmte Region wünschst. Denn tierische Liebe kennt keine Grenzen – nur Menschen, die sie teilen wollen.",
      ],
      sections: [
        {
          heading: "Flirten mit Herz und Pfote: So klappt’s bei Tierfreunden",
          imageUrl:
            "https://static-cms.icony-hosting.de/cms/EA9AA871A3B9A9A221AB9EF499517D23A51ED91184ACF14670847179E5D138A3/1000/tierisch-verliebt-ch-(1).jpg",
          imageAlt: "Tierfreunde beim Kennenlernen in der Schweiz",
          paragraphs: [
            "Flirten unter Tierfreunden hat einen entscheidenden Vorteil: Das Eis ist durch die gemeinsame Liebe zu Tieren meist schnell gebrochen. Ein Gespräch über Haustiere ist ein perfekter Einstieg, denn es wirkt authentisch, zeigt Einfühlungsvermögen und sorgt für gemeinsame Themen. Erwähne charmant Anekdoten über dein Tier, ohne dabei zu übertreiben, und zeige echtes Interesse an den Geschichten deines Gegenübers.",
            "Wichtig ist, beim Flirten authentisch zu bleiben und nicht nur über Tiere zu reden. Ein Balanceakt zwischen persönlichem Austausch und tierischen Geschichten macht den Dialog spannend und verhindert, dass der Fokus ausschließlich auf den Vierbeinern liegt. Humorvolle Bemerkungen über die Eigenarten des Haustiers lockern die Stimmung zusätzlich.",
          ],
        },
        {
          heading: "Das erste Date mit Hund, Katze & Co: Was du beachten solltest",
          paragraphs: [
            "Das erste Date mit einem Haustier kann sowohl ein Pluspunkt als auch eine Herausforderung sein. Hunde sind ideale Eisbrecher bei einem Spaziergang oder Picknick im Park – sie bringen Dynamik und sorgen für lockere Gespräche. Katzen hingegen sind eher Beobachter und eignen sich besser für Dates zu Hause, wenn man sich schon etwas kennt.",
            "Wichtig ist, das Tier nicht in den Mittelpunkt zu drängen. Das Date sollte immer noch um euch als Menschen gehen. Überlege dir einen neutralen Treffpunkt, falls du unsicher bist, ob dein Gegenüber mit Tieren vertraut ist. Ein zu stürmischer Hund oder eine scheue Katze könnten sonst das erste Treffen belasten.",
          ],
        },
        {
          heading: "Tierliebe und Partnersuche: Chancen und Herausforderungen",
          paragraphs: [
            "Die Liebe zu Tieren verbindet, aber sie kann auch für Komplikationen sorgen. Einer der größten Vorteile ist, dass tierliebe Menschen meist warmherzig, fürsorglich und geduldig sind – Eigenschaften, die eine stabile Partnerschaft fördern. Außerdem kann ein Haustier ein gemeinsames Gesprächsthema sein und zeigt viel über den Charakter seines Besitzers.",
            "Auf der anderen Seite erfordert ein Tier Zeit, Aufmerksamkeit und Verantwortung, was die Partnersuche manchmal erschwert. Ein Partner ohne Tiererfahrung könnte Schwierigkeiten haben, den Alltag mit einem Haustier zu verstehen oder zu akzeptieren. Offene Kommunikation über die Rolle des Tiers im Leben ist hier der Schlüssel.",
          ],
        },
        {
          heading: "Wie Haustiere beim Kennenlernen helfen – oder stören können",
          paragraphs: [
            "Haustiere sind perfekte Türöffner für neue Kontakte. Ein Hundespaziergang, ein Besuch im Tierpark oder ein Gespräch im Wartezimmer beim Tierarzt – solche Situationen schaffen automatisch Gelegenheiten, ins Gespräch zu kommen. Tiere wirken sympathisch und zeigen, dass man Verantwortung übernehmen kann.",
            "Doch es gibt auch Stolperfallen: Manche Menschen haben Angst vor Tieren oder Allergien, was spontane Treffen schwieriger machen kann. Auch ein dominantes Haustier, das ständig Aufmerksamkeit fordert, kann den Kennenlernprozess bremsen. Ein gutes Timing und die richtige Dosierung der Tierpräsenz sind deshalb entscheidend.",
          ],
        },
      ],
    },
  },
};

export function getMarketCityPages(market: MarketCode): MarketCityPage[] {
  return imports[market].pages;
}

export function getMarketCityPage(market: MarketCode, slug: string): MarketCityPage | null {
  return imports[market].pages.find((page) => page.slug === slug) ?? null;
}

export function getMarketPartnersucheHub(market: MarketCode) {
  const copy = HUB_COPY[market];
  return {
    market,
    title: copy.title,
    description: copy.description,
    editorial: copy.editorial,
    cities: imports[market].pages.map((page) => ({
      slug: page.slug,
      cityName: page.cityName,
      href: page.path,
      imageUrl: page.imageUrl,
      imageAlt: page.imageAlt,
      description: page.description,
    })),
  };
}

export function getNearbyMarketCities(market: MarketCode, slug: string, count = 6) {
  const pages = getMarketCityPages(market);
  const index = pages.findIndex((page) => page.slug === slug);
  const ordered = index >= 0 ? [...pages.slice(index + 1), ...pages.slice(0, index)] : pages;
  return ordered.slice(0, count);
}
