import type { ReactNode } from "react";
import { MarketLink } from "@/components/market-link";
import { PawIcon } from "@/components/city-page/tier-icons";
import { display } from "@/components/city-page/display-font";
import { NL_PLATFORM, nlRegistrationUrl, type NlInfoPage } from "@/lib/nl-routes";
import { staticAsset } from "#static-asset";
import "@/components/city-page/tier-city-page.css";
import "@/components/city-page/tier-city-hub.css";

/**
 * Over ons, Privacy und Colofon des NL-Piloten. Texte hier, Meta in NL_INFO_META.
 * Betreibername nur in den noindex-Rechtstexten, Over ons und JSON-LD nennen nur Christian M. Haas
 * (wie bei single-cristiani.ch). Die Plattform tierisch-verliebt.de betreibt ICONY, deren Rechtstexte bleiben dort.
 */
export const NL_INFO_META: Record<NlInfoPage, { title: string; description: string; badge: string; h1: string }> = {
  "over-ons": {
    title: "Over ons: de redactie van tierisch-verliebt.nl",
    description: "Wie er achter tierisch-verliebt.nl zit: wie de stadsgidsen en rasportretten maakt, hoe we werken, waarom aanmelden voorlopig in het Duits gaat en hoe je ons bereikt.",
    badge: "Over ons",
    h1: "Wie er achter tierisch-verliebt.nl zit",
  },
  privacy: {
    title: "Privacyverklaring",
    description: "Welke gegevens tierisch-verliebt.nl verwerkt: hosting bij Vercel, cookievrije statistieken met Vercel Web Analytics, YouTube-video's en je rechten.",
    badge: "Privacy",
    h1: "Privacyverklaring",
  },
  colofon: {
    title: "Colofon",
    description: "Colofon van tierisch-verliebt.nl: verantwoordelijke voor de inhoud, contact, het platform tierisch-verliebt.de en aansprakelijkheid voor inhoud en links.",
    badge: "Colofon",
    h1: "Colofon",
  },
};

export const NL_AUTHOR = {
  name: "Christian M. Haas",
  jobTitle: "Oprichter en hoofdredacteur",
  image: "/magazin/wp-content/uploads/2025/11/Christian-M-Haas-Middle-243x300.png",
  sameAs: [
    "https://tierisch-verliebt.de/magazin/christian/",
    "https://www.linkedin.com/in/christian-m-haas-457323379",
    "https://www.amazon.com/author/christian-m-haas",
    "https://datingnischen.de/christian",
  ],
} as const;

const AUTHOR_LINKS = [
  { label: "Profiel op tierisch-verliebt.de (Duits)", href: NL_AUTHOR.sameAs[0], hrefLang: "de-DE" },
  { label: "LinkedIn", href: NL_AUTHOR.sameAs[1], hrefLang: undefined },
  { label: "Auteurspagina op Amazon", href: NL_AUTHOR.sameAs[2], hrefLang: undefined },
  { label: "Biografie op datingnischen.de (Duits)", href: NL_AUTHOR.sameAs[3], hrefLang: "de-DE" },
];

export const NL_ABOUT_FAQ = [
  { question: "Is tierisch-verliebt.nl gratis?", answer: "Ja. De stadsgidsen en het magazine zijn gratis en zonder account te lezen. Ook aanmelden op het platform is gratis; betaalde functies worden daar duidelijk vermeld voordat je iets koopt." },
  { question: "Wie verwerkt mijn gegevens als ik me aanmeld?", answer: "Je meldt je aan op tierisch-verliebt.de. Je profielgegevens verwerkt de ICONY GmbH volgens haar eigen privacyverklaring. Op tierisch-verliebt.nl zelf is er geen aanmelding; welke gegevens deze website verwerkt, lees je in onze privacyverklaring." },
  { question: "Betalen parken, dierenartsen of cafés om in de gidsen te staan?", answer: "Nee. We kiezen plekken en tips op basis van hun nut voor dierenliefhebbers. Geen enkele vermelding is gesponsord en we publiceren geen betaalde recensies." },
  { question: "Kan ik een plek of een fout melden?", answer: "Graag. Stuur ons een e-mail met de naam, de plaats en een korte omschrijving. We controleren elke melding en passen de gids zo nodig snel aan." },
];

const OPERATOR = <p>
  Christian Mogge Internetdienstleistungen<br />
  c/o Grosch Postflex #1280<br />
  Emsdettener Str. 10<br />
  48268 Greven, Duitsland<br />
  E-mail: kontakt[a]m-perfect.de
</p>;

function About() {
  return <>
    <section>
      <h2>Een gids, geen apart datingplatform</h2>
      <p>tierisch-verliebt.nl is de Nederlandse tak van tierisch-verliebt, het datingplatform voor dierenliefhebbers uit Duitsland, Oostenrijk en Zwitserland. Hier publiceren we <MarketLink market="nl" path="/partnersuche">stadsgidsen voor vijftien Nederlandse steden</MarketLink> met parken, wandelroutes, ideeën voor een eerste date en praktische tips voor het leven met dieren, en een <MarketLink market="nl" path="/magazin">magazine met rasportretten</MarketLink> over honden en katten.</p>
      <p>Profielen, berichten en abonnementen staan niet op deze website, maar op het platform tierisch-verliebt.de, dat de ICONY GmbH beheert. De knoppen „Aanmelden” en „Inloggen” brengen je daarheen. De gegevens van de verantwoordelijke vind je in het <MarketLink market="nl" path="/colofon">colofon</MarketLink>.</p>
    </section>
    <section>
      <h2>Zo werken we</h2>
      <ul>
        <li><strong>Officiële bronnen.</strong> Regels voor honden, losloopgebieden en opruimplicht verschillen per gemeente. In de stadsgidsen verwijzen we daarom naar de actuele informatie van de gemeente zelf, omdat zulke regels kunnen veranderen.</li>
        <li><strong>Vertaalde rasportretten.</strong> De tien rasportretten zijn Nederlandse vertalingen van onze Duitse artikelen. Prijzen en sommige voedingsadviezen gaan uit van de Duitse situatie; we controleren ze en werken beide taalversies samen bij.</li>
        <li><strong>Gemarkeerde beelden.</strong> De stadsimpressies boven de stadsgidsen zijn met kunstmatige intelligentie gemaakt en als zodanig gemarkeerd. Ze tonen geen echte personen en geen leden van het platform.</li>
        <li><strong>Hulpmiddelen.</strong> Bij het schrijven en vertalen gebruiken we ook AI-hulpmiddelen. Feiten, adressen en links controleren we aan de hand van de genoemde bronnen, en elke tekst wordt voor publicatie nagelezen.</li>
        <li><strong>Geen betaalde inhoud.</strong> We publiceren geen gesponsorde artikelen en geen recensies van parken, dierenartsen of horeca.</li>
      </ul>
    </section>
    <section className="nl-about-author" aria-labelledby="wie-schrijft">
      <img src={staticAsset(NL_AUTHOR.image)} alt={`Portret van ${NL_AUTHOR.name}`} width={160} height={198} loading="lazy" decoding="async" />
      <div>
        <h2 id="wie-schrijft">{NL_AUTHOR.name}</h2>
        <p className="nl-about-role">{NL_AUTHOR.jobTitle}</p>
        <p>Christian M. Haas richtte tierisch-verliebt op uit eigen liefde voor dieren. Al sinds zijn jeugd horen dieren bij zijn leven, van zijn eerste valkparkiet tot de twee katten en drie grijze roodstaartpapegaaien die nu bij hem wonen.</p>
        <p>Hij houdt zich sinds 2008 bezig met online daten en ontwikkelt al jaren datingplatforms voor mensen met een gedeelde passie. In 2026 verscheen zijn boek „Dating ohne Bullshit” (in het Duits), een blik achter de schermen van de datingbranche. Zijn doel: mensen samenbrengen bij wie dieren gewoon bij de familie horen, met respect, veiligheid en echtheid.</p>
        <ul className="nl-about-links">
          {AUTHOR_LINKS.map((link) => <li key={link.href}><a href={link.href} hrefLang={link.hrefLang} rel="noopener">{link.label}</a></li>)}
        </ul>
      </div>
    </section>
    <section id="platform">
      <h2>Waarom aanmelden voorlopig in het Duits gaat</h2>
      <p>Een Nederlandse versie van het ledenplatform bestaat nog niet. Tot die tijd gaan <a href={nlRegistrationUrl("location")} hrefLang="de-DE">aanmelden</a> en <a href={NL_PLATFORM.loginUrl} hrefLang="de-DE">inloggen</a> via het Duitstalige platform tierisch-verliebt.de. De menu&apos;s en berichten daar zijn in het Duits. Zodra er een Nederlandse versie is, passen we de links op alle pagina&apos;s aan.</p>
    </section>
    <section>
      <h2>Contact en meldingen</h2>
      <p>Klopt er iets niet meer, is een link verouderd of ken je een plek die in een stadsgids thuishoort? Schrijf ons, in het Nederlands, Duits of Engels: <strong>kontakt[a]m-perfect.de</strong>. We controleren elke melding en passen de gids zo snel mogelijk aan.</p>
      <p>Voor vragen over je account, abonnement of profielgegevens neem je direct contact op met tierisch-verliebt.de: deze website heeft geen toegang tot ledengegevens.</p>
    </section>
    <section className="nl-about-faq" aria-labelledby="vragen-site">
      <h2 id="vragen-site">Veelgestelde vragen over deze website</h2>
      {NL_ABOUT_FAQ.map((entry) => <details key={entry.question}><summary>{entry.question}</summary><p>{entry.answer}</p></details>)}
    </section>
  </>;
}

function Colofon() {
  return <>
    <h2>Verantwoordelijk voor de inhoud</h2>
    {OPERATOR}
    <h2>Platform tierisch-verliebt.de</h2>
    <p>tierisch-verliebt.nl is een informatieve website in het Nederlands. Aanmelden, profielen, berichten en abonnementen vind je op het platform tierisch-verliebt.de, dat de ICONY GmbH beheert. Voor het platform geldt het <a href="https://tierisch-verliebt.de/impressum.html" hrefLang="de-DE">impressum van tierisch-verliebt.de</a> (Duits).</p>
    <h2>Aansprakelijkheid voor de inhoud</h2>
    <p>We stellen de inhoud van deze pagina&apos;s met zorg samen. Voor de juistheid, volledigheid en actualiteit van de informatie kunnen we echter geen garantie geven. Wijs je ons op onjuiste of onrechtmatige inhoud, dan controleren we die en passen we haar zo snel mogelijk aan of verwijderen we haar.</p>
    <h2>Aansprakelijkheid voor links</h2>
    <p>Onze pagina&apos;s bevatten links naar websites van derden, op de inhoud waarvan we geen invloed hebben. Voor de inhoud van gelinkte pagina&apos;s is altijd de betreffende aanbieder verantwoordelijk. Worden we op schendingen gewezen, dan verwijderen we de betreffende link.</p>
    <h2>Auteursrecht</h2>
    <p>De teksten en beelden op deze website zijn auteursrechtelijk beschermd. Verveelvoudiging, bewerking en verspreiding buiten de wettelijke grenzen vereisen onze schriftelijke toestemming. De stadsimpressies zijn met kunstmatige intelligentie gemaakt en als zodanig gemarkeerd.</p>
  </>;
}

function Privacy() {
  return <>
    <p>Op deze pagina lees je welke gegevens worden verwerkt als je tierisch-verliebt.nl bezoekt. De website is een informatieve gids: er zijn geen accounts, reacties, contactformulieren of nieuwsbrieven, en we plaatsen geen eigen cookies.</p>
    <h2>Verwerkingsverantwoordelijke</h2>
    {OPERATOR}
    <p>Meer informatie vind je in het <MarketLink market="nl" path="/colofon">colofon</MarketLink>.</p>
    <h2>Hosting en logbestanden</h2>
    <p>De website wordt gehost door Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, Verenigde Staten. Bij elk bezoek stuurt je browser technische gegevens mee: IP-adres, datum en tijd, de opgevraagde pagina, de hoeveelheid gegevens en de statuscode, browser en besturingssysteem en, als die wordt meegestuurd, de pagina waar je vandaan komt. Deze gegevens zijn nodig om de pagina&apos;s te tonen en de dienst te beveiligen; Vercel bewaart ze maar kort. Vercel is gecertificeerd onder het EU-US Data Privacy Framework; meer daarover in de <a href="https://vercel.com/legal/privacy-policy">privacyverklaring van Vercel</a>.</p>
    <p>Rechtsgrond is ons gerechtvaardigd belang bij een veilige en betrouwbare website (art. 6 lid 1 sub f AVG).</p>
    <h2>Statistieken met Vercel Web Analytics</h2>
    <p>Om te begrijpen welke pagina&apos;s worden gelezen, gebruiken we Vercel Web Analytics van Vercel Inc., Verenigde Staten. Het script stuurt gegevens over het bezoek naar Vercel, bijvoorbeeld het tijdstip, het adres van de pagina, de pagina waar je vandaan komt, een globale locatie, browser, besturingssysteem en type apparaat. Vercel Web Analytics gebruikt geen cookies: om bezoeken van elkaar te onderscheiden gebruikt het een hashwaarde die uit het verzoek wordt afgeleid en na 24 uur wordt weggegooid. Die termijn geldt voor het bezoekkenmerk, niet voor de bewaring van de samengevoegde statistieken, die we ook in onze interne rapportage gebruiken, bijvoorbeeld het aantal weergaven per pagina en per maand.</p>
    <p>Rechtsgrond is ons gerechtvaardigd belang om het bereik van onze inhoud te begrijpen (art. 6 lid 1 sub f AVG); je kunt hier altijd bezwaar tegen maken via het adres hierboven (art. 21 AVG). Gegevens kunnen naar de Verenigde Staten worden doorgegeven. Meer informatie in de <a href="https://vercel.com/docs/analytics/privacy-policy">documentatie van Vercel Web Analytics</a>.</p>
    <h2>YouTube-video&apos;s</h2>
    <p>In sommige rasportretten tonen we video&apos;s van YouTube, een dienst van Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ierland. We gebruiken de uitgebreide privacymodus (youtube-nocookie.com) en laden de video pas als je naar de video scrolt. Op dat moment maakt je browser verbinding met servers van YouTube en Google en ontvangen zij technische gegevens zoals je IP-adres. Als je de video afspeelt, kan YouTube cookies of vergelijkbare technieken gebruiken. Daarvoor geldt de <a href="https://policies.google.com/privacy?hl=nl">privacyverklaring van Google</a>; gegevens kunnen naar de Verenigde Staten worden doorgegeven.</p>
    <p>Rechtsgrond is ons gerechtvaardigd belang bij een aantrekkelijke presentatie van onze artikelen (art. 6 lid 1 sub f AVG).</p>
    <h2>Links naar het platform</h2>
    <p>De knoppen voor aanmelden en inloggen brengen je naar tierisch-verliebt.de, dat de ICONY GmbH beheert. Zodra je het platform opent, geldt de <a href="https://tierisch-verliebt.de/datenschutz.html" hrefLang="de-DE">privacyverklaring van tierisch-verliebt.de</a> (Duits); op de gegevensverwerking daar hebben we geen invloed.</p>
    <h2>Lettertypen en beelden</h2>
    <p>Lettertypen, beelden en scripts komen van onze hosting bij Vercel. Behalve de YouTube-video&apos;s hierboven laden we geen inhoud van andere aanbieders.</p>
    <h2>Contact per e-mail</h2>
    <p>Als je ons schrijft, verwerken we je e-mailadres en de inhoud van je bericht om je vraag te beantwoorden (art. 6 lid 1 sub f AVG). We verwijderen de berichten zodra je vraag is afgehandeld en er geen bewaarplicht geldt.</p>
    <h2>Jouw rechten</h2>
    <ul>
      <li>inzage in de verwerkte gegevens (art. 15 AVG)</li>
      <li>rectificatie van onjuiste gegevens (art. 16 AVG)</li>
      <li>verwijdering (art. 17 AVG)</li>
      <li>beperking van de verwerking (art. 18 AVG)</li>
      <li>overdraagbaarheid van gegevens (art. 20 AVG)</li>
      <li>bezwaar tegen verwerking op basis van gerechtvaardigd belang (art. 21 AVG)</li>
    </ul>
    <p>Een e-mail naar het adres hierboven is voldoende. Je hebt daarnaast het recht een klacht in te dienen bij een toezichthoudende autoriteit, bijvoorbeeld de Autoriteit Persoonsgegevens in Nederland of de voor ons bevoegde Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen.</p>
    <h2>Beveiliging en wijzigingen</h2>
    <p>De verbinding tussen je browser en onze website is versleuteld met TLS. We werken deze verklaring bij als de techniek van de website of de wetgeving verandert; de hier gepubliceerde versie is geldig.</p>
  </>;
}

const BODY: Record<NlInfoPage, () => ReactNode> = { "over-ons": About, privacy: Privacy, colofon: Colofon };

export function NlInfoPageView({ page }: { page: NlInfoPage }) {
  const meta = NL_INFO_META[page];
  const Body = BODY[page];
  return <main className={`tvc tvh ${display.variable}`}>
    <section className="tvc-hero tvh-hero nl-info-hero"><div className="tvc-wrap">
      <nav className="tvc-crumbs" aria-label="Broodkruimels"><MarketLink market="nl" path="/">Home</MarketLink><span aria-hidden="true">›</span><span aria-current="page">{meta.badge}</span></nav>
      <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />{meta.badge}</span>
      <h1>{meta.h1}</h1>
      {page === "over-ons" ? <p className="tvc-lead">tierisch-verliebt.nl is een gids voor singles in Nederland bij wie hond, kat en co. bij de familie horen. Hier lees je wie de gidsen maakt, hoe we werken en hoe aanmelden werkt.</p> : null}
    </div></section>
    <div className="tvc-wrap nl-info-body"><article className="rich-content">
      <Body />
    </article></div>
  </main>;
}
