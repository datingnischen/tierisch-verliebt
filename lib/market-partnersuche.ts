import data from "../data/partnersuche-markets.json" with { type: "json" };
import nlData from "../data/nl-partnersuche.json" with { type: "json" };
import itData from "../data/it-partnersuche.json" with { type: "json" };
import { staticAsset } from "#static-asset";
import { IT_PLATFORM } from "#it-routes";
import { NL_PLATFORM, nlRegistrationUrl } from "#nl-routes";
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
  imageIsGenerated?: boolean;
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

const HUB_COPY: Record<Exclude<MarketCode, "nl" | "it">, HubCopy> = {
  de: {
    title: "Finde tierliebe Singles aus deiner Region",
    description: "Wähle deine Stadt und entdecke tierliebe Singles, lokale Treffpunkte und hilfreiche Tipps für einen entspannten Einstieg.",
    editorial: {
      heroImageUrl: staticAsset("/cities/de/partnersuche-deutschland.jpg"),
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
      heroImageUrl: staticAsset("/cities/at/partnersuche-oesterreich.jpg"),
      heroImageAlt: "Partnersuche für Tierfreunde in Österreich",
      introParagraphs: [
        "Du bist Single, liebst Tiere und suchst nach Gleichgesinnten, mit denen du schöne Stunden verbringen kannst – am besten gemeinsam mit deinem Hund, deiner Katze oder einfach mit Tierliebe im Herzen? Dann bist du bei tierisch-verliebt.at genau richtig. Wir zeigen dir, wo Dating mit tierischem Bezug in deiner Stadt oder Region besonders gut funktioniert.",
        "Hier findest du eine Übersicht aller Städte in Österreich, für die wir besondere Tipps, Parks, Cafés und Locations für tierliebe Singles zusammengestellt haben:",
        "Ganz egal, ob du in einer großen Stadt wie Wien wohnst oder in einer kleineren Gemeinde – wir möchten dir zeigen, wo du nicht nur neue Kontakte knüpfen, sondern dich vielleicht auch richtig verlieben kannst.",
      ],
      sections: [
        {
          heading: "Warum Dating mit Tieren oft besser funktioniert",
          imageUrl: staticAsset("/cities/at/partnersuche-dating-mit-tieren.jpg"),
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
          imageUrl: staticAsset("/cities/at/partnersuche-liebe-mit-herz-und-pfote.jpg"),
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
      heroImageUrl: staticAsset("/cities/ch/partnersuche-schweiz.jpg"),
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
          imageUrl: staticAsset("/cities/ch/partnersuche-flirten-mit-herz-und-pfote.jpg"),
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

export function withPostcodeSearch(page: MarketCityPage): MarketCityPage {
  const postcodePattern = page.market === "nl" ? /^[1-9]\d{3}\s?[A-Z]{2}$/ : page.market === "de" ? /^\d{5}$/ : /^\d{4}$/;
  if (!postcodePattern.test(page.icony.zip)) {
    throw new Error(`Invalid postcode for ${page.market}/${page.slug}: ${page.icony.zip}`);
  }
  const url = new URL(page.searchUrl);
  const aid = url.searchParams.get("AID");
  if (aid !== "location") {
    throw new Error(`Invalid search attribution for ${page.market}/${page.slug}`);
  }
  url.search = "";
  url.searchParams.set("plz", page.icony.zip);
  url.searchParams.set("AID", aid);
  return { ...page, searchUrl: url.toString() };
}

/**
 * Bilder der DE/AT/CH-Stadtseiten liegen im Repo unter public/cities/<land>/ (Regel 2026-10-20: keine Bilder
 * aus dem ICONY-CMS laden). Die Daten speichern Pfade wie "/cities/at/wien.jpg"; hier werden sie – auch im
 * Fließtext – zur Adresse auf dem Asset-Host.
 */
function withLocalImages(page: MarketCityPage): MarketCityPage {
  return {
    ...page,
    imageUrl: page.imageUrl ? staticAsset(page.imageUrl) : page.imageUrl,
    contentHtml: page.contentHtml.replace(/(<img\b[^>]*\bsrc=")(\/[^"]+)"/gi, (_, prefix: string, src: string) => `${prefix}${staticAsset(src)}"`),
  };
}

export function getMarketCityPages(market: MarketCode): MarketCityPage[] {
  if (market === "nl") return nlCityPages();
  if (market === "it") return itCityPages();
  return imports[market].pages.map((page) => withPostcodeSearch(withLocalImages(page)));
}

export function getMarketCityPage(market: MarketCode, slug: string): MarketCityPage | null {
  if (market === "nl") return nlCityPages().find(page => page.slug === slug) ?? null;
  if (market === "it") return itCityPages().find(page => page.slug === slug) ?? null;
  const page = imports[market].pages.find((entry) => entry.slug === slug);
  return page ? withPostcodeSearch(withLocalImages(page)) : null;
}

export function getMarketPartnersucheHub(market: MarketCode) {
  const copy: HubCopy = market === "nl" ? {
    title: nlData.title, description: nlData.description,
    editorial: { heroImageUrl: staticAsset("/home/frontpage-visual-tierischverliebt.webp"), heroImageAlt: "Dierenliefde en dating", introParagraphs: nlData.introParagraphs, sections: nlData.sections },
  } : market === "it" ? {
    title: itData.title, description: itData.description,
    editorial: { heroImageUrl: null, heroImageAlt: null, introParagraphs: itData.introParagraphs, sections: itData.sections },
  } : HUB_COPY[market];
  return {
    market,
    title: copy.title,
    description: copy.description,
    editorial: copy.editorial,
    cities: getMarketCityPages(market).map((page) => ({
      slug: page.slug,
      cityName: page.cityName,
      href: page.path,
      imageUrl: page.imageUrl,
      imageAlt: page.imageAlt,
      description: page.description,
    })),
  };
}

function nlCityPages(): MarketCityPage[] {
  return nlData.pages.map(page => withPostcodeSearch({
    market: "nl", slug: page.slug, path: `/partnersuche/${page.slug}`,
    sourceUrl: `https://tierisch-verliebt.nl/partnersuche/${page.slug}/`,
    title: `Dating voor dierenliefhebbers in ${page.cityName}`,
    cityName: page.cityName, description: page.description, lead: page.lead,
    imageUrl: staticAsset(page.imageUrl), imageAlt: page.imageAlt,
    imageIsGenerated: page.imageIsGenerated,
    // Municipal sources are linked in the guide; city illustrations are AI-generated.
    contentHtml: page.contentHtml, sourceAttributionUrl: null,
    registrationUrl: nlRegistrationUrl("location"),
    searchUrl: NL_PLATFORM.searchUrl,
    icony: { platformId: "", zip: page.postcode, country: 31, frameUrl: "" },
  }));
}



function itCityPages(): MarketCityPage[] {
  return itData.pages.map(page => withPostcodeSearch({
    market: "it", slug: page.slug, path: `/${page.slug}`,
    sourceUrl: `https://tierisch-verliebt.ch/it/${page.slug}/`,
    title: page.title, cityName: page.cityName, description: page.description, lead: page.lead,
    imageUrl: null, imageAlt: null,
    contentHtml: page.contentHtml, sourceAttributionUrl: null,
    registrationUrl: IT_PLATFORM.registrationUrl,
    searchUrl: IT_PLATFORM.searchUrl,
    icony: { platformId: "tierischverliebtch", zip: page.postcode, country: 41, frameUrl: "" },
  }));
}

type ItLink = { url?: string | null };
/** Belegter Stadtführer der Tessiner Seiten (data/it-partnersuche.json, pages[].guide). */
export type ItCityGuide = {
  facts: { label: string; value: string; note: string; source: string }[];
  dogAreas: ({ name: string; address: string; text: string } & ItLink)[];
  rules: ({ title: string; text: string } & ItLink)[];
  walks: ({ name: string; where: string; text: string } & ItLink)[];
  shelters: ({ name: string; address: string; text: string } & ItLink)[];
  vet: { text: string } & ItLink;
  events: ({ name: string; when: string; text: string } & ItLink)[];
  faq: { question: string; answer: string }[];
  sources: { title: string; url: string }[];
};

export function getItCityGuide(slug: string): ItCityGuide | null {
  const page = itData.pages.find((entry) => entry.slug === slug) as { guide?: ItCityGuide } | undefined;
  return page?.guide ?? null;
}

export function getItFaq() {
  return itData.faq;
}
