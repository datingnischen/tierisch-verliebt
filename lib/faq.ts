import { getMarket, publicUrl, type MarketCode } from "#markets";

/** Fragenseite /faq/ – gleicher Standardpfad wie /magazin/ und /ueber-uns/ auf allen Plattformen. */
export const FAQ_PATH = "/faq";

/**
 * platform: Seite der ICONY-Plattform, immer absolut auf die Live-Domain des Markts.
 * deOnly: Seite gibt es nur auf tierisch-verliebt.de (Magazin, Über uns); in AT/CH absolut auf .de.
 */
export type FaqLink = { label: string; path: string; platform?: boolean; deOnly?: boolean };
export type FaqItem = { question: string; answer: string; links?: FaqLink[] };
export type FaqTopic = { id: string; title: string; items: FaqItem[] };

export type FaqMarket = Exclude<MarketCode, "nl">;

export function isFaqMarket(value: string): value is FaqMarket {
  return value === "de" || value === "at" || value === "ch";
}

export function faqCanonical(market: FaqMarket) {
  return publicUrl(market, FAQ_PATH);
}

/** Schweizer Rechtschreibung: ss statt ß. */
function localize(market: FaqMarket, text: string) {
  return market === "ch" ? text.replace(/ß/g, "ss") : text;
}

const COUNTRY: Record<FaqMarket, string> = { de: "Deutschland", at: "Österreich", ch: "der Schweiz" };

/**
 * Sachliche Fragen und Antworten, nur zu Dingen, die auf der Seite belegt sind. Plattformthemen
 * (Login, Mitgliedschaft, Datenschutz) liegen bei ICONY und werden absolut auf die Live-Domain verlinkt.
 */
export function getFaqTopics(market: FaqMarket): FaqTopic[] {
  const country = COUNTRY[market];
  const topics: FaqTopic[] = [
    {
      id: "ueber-uns",
      title: "Über tierisch-verliebt",
      items: [
        {
          question: "Was ist tierisch-verliebt?",
          answer: `tierisch-verliebt ist eine Partnerbörse für Tierfreunde. Sie verbindet Singles in ${country}, für die Hund, Katze und andere Tiere zum Alltag gehören, und ergänzt das Kennenlernen um ein Magazin mit Ratgebern rund ums Tier.`,
        },
        {
          question: "Für wen ist die Seite gedacht?",
          answer: "Für alle, die jemanden kennenlernen möchten, der ihre Liebe zu Tieren teilt – unabhängig davon, ob sie selbst ein Tier haben oder sich eines wünschen.",
        },
        {
          question: "Wer steht hinter tierisch-verliebt?",
          answer: "Die Plattform wird von der ICONY GmbH betrieben. Redaktionell begleitet Datingexperte Christian M. Haas das Magazin. Hintergründe, Bewertungen und die offiziellen Social-Media-Kanäle findest du im Bereich Über uns.",
          links: [{ label: "Über uns", path: "/ueber-uns", deOnly: true }],
        },
      ],
    },
    {
      id: "registrierung",
      title: "Registrierung & Konto",
      items: [
        {
          question: "Kostet die Registrierung etwas?",
          answer: "Nein, die Registrierung ist kostenlos. Welche weiteren Funktionen es gibt und zu welchen Bedingungen, siehst du direkt auf der Plattform während und nach der Anmeldung.",
          links: [{ label: "Kostenlos registrieren", path: "/registration/?AID=location", platform: true }],
        },
        {
          question: "Wie melde ich mich an?",
          answer: "Über die Registrierung gibst du Angaben zu dir und deiner Suche ein und legst dein Profil an. Die Anmeldung läuft auf der Plattform von ICONY.",
          links: [{ label: "Zur Registrierung", path: "/registration/?AID=location", platform: true }],
        },
        {
          question: "Ich habe mich schon registriert – wo logge ich mich ein?",
          answer: "Der Login befindet sich auf der Plattform. Rückfragen zu deinem Konto und deinen Zugangsdaten beantwortet der Betreiber dort; Kontaktdaten stehen im Impressum.",
          links: [
            { label: "Zum Login", path: "/login/", platform: true },
            { label: "Impressum", path: "/impressum.html", platform: true },
          ],
        },
      ],
    },
    {
      id: "partnersuche",
      title: "Partnersuche & Städte",
      items: [
        {
          question: "Wie finde ich tierliebe Singles in meiner Stadt?",
          answer: `Auf der Seite Partnersuche findest du Städteseiten für ${country}. Dort gibt es Informationen zur Region, zu tierfreundlichen Orten und den Einstieg in die Suche nach Singles in deiner Nähe.`,
          links: [{ label: "Zur Partnersuche", path: "/partnersuche" }],
        },
        {
          question: "Was sind die Gassi-Guides?",
          answer: "Die Städteseiten sammeln Tipps für Tierfreunde vor Ort, zum Beispiel Hundewiesen, tierfreundliche Cafés und Adressen rund ums Tier. Sie helfen dir, passende Orte für ein erstes Treffen zu finden.",
          links: [{ label: "Städte entdecken", path: "/partnersuche" }],
        },
        {
          question: "Gibt es tierisch-verliebt auch in Österreich und der Schweiz?",
          answer: "Ja, es gibt eigene Auftritte für Deutschland, Österreich und die Schweiz mit Städteseiten für das jeweilige Land. Das Land wählst du unten im Seitenfuß.",
        },
      ],
    },
    {
      id: "magazin",
      title: "Magazin & Ratgeber",
      items: [
        {
          question: "Was finde ich im Magazin?",
          answer: "Ratgeber und Porträts rund um Hunde, Katzen und weitere Tierwelten, dazu Beiträge zum Thema Dating. Ein Inhaltsverzeichnis von A bis Z hilft beim Stöbern. Das Magazin erscheint auf tierisch-verliebt.de.",
          links: [
            { label: "Zum Magazin", path: "/magazin", deOnly: true },
            { label: "Inhaltsverzeichnis A–Z", path: "/magazin/inhalt", deOnly: true },
          ],
        },
        {
          question: "Wie finde ich einen bestimmten Artikel oder eine Rasse?",
          answer: "Nutze die Seitensuche im Bereich Über uns. Sie durchsucht Ratgeber, Rassen und Städteseiten.",
          links: [{ label: "Zur Suche", path: "/ueber-uns/suche", deOnly: true }],
        },
      ],
    },
    {
      id: "datenschutz",
      title: "Datenschutz & Sicherheit",
      items: [
        {
          question: "Wie werden meine Daten geschützt?",
          answer: "Für Registrierung und Profil gilt die Datenschutzerklärung der Plattform. Dort steht, welche Daten verarbeitet werden und welche Rechte du hast.",
          links: [{ label: "Datenschutzerklärung", path: "/datenschutz.html", platform: true }],
        },
        {
          question: "Wo finde ich Hinweise zur Sicherheit beim Online-Dating?",
          answer: "Die Plattform bietet eine eigene Seite zu Sicherheit und Datenschutz. Allgemeine Dating-Tipps findest du zusätzlich im Magazin.",
          links: [{ label: "Sicherheit und Datenschutz", path: "/sicherheit-und-datenschutz.html", platform: true }],
        },
      ],
    },
  ];

  return topics.map((topic) => ({
    ...topic,
    title: localize(market, topic.title),
    items: topic.items.map((item) => ({
      ...item,
      question: localize(market, item.question),
      answer: localize(market, item.answer),
      links: item.links?.map((link) => ({ ...link, label: localize(market, link.label) })),
    })),
  }));
}

export function faqPageSchema(market: FaqMarket, topics = getFaqTopics(market)) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${faqCanonical(market)}#faq`,
    url: faqCanonical(market),
    inLanguage: getMarket(market).locale,
    mainEntity: topics.flatMap((topic) =>
      topic.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    ),
  };
}

export function faqBreadcrumbSchema(market: FaqMarket) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: publicUrl(market, "/") },
      { "@type": "ListItem", position: 2, name: "Häufige Fragen", item: faqCanonical(market) },
    ],
  };
}
