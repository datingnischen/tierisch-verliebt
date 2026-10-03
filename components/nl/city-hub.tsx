import { BreedGrid } from "./magazine";
import { MarketLink } from "@/components/market-link";
import type { GuideTopic } from "@/lib/city-guide";
import { ANIMAL_LABELS, TOPIC_LABELS } from "./copy";
import { getCityHubData } from "@/lib/city-hub";
import { getMarketPartnersucheHub } from "@/lib/market-partnersuche";
import { getMarket, publicUrl, type MarketCode } from "@/lib/markets";
import { NlCityFinder } from "./city-finder";
import { AnimalIcon, HeartIcon, PawIcon, TopicIcon } from "../city-page/tier-icons";
import { display } from "../city-page/display-font";
import "../city-page/tier-city-page.css";
import "../city-page/tier-city-hub.css";


const REGION_LABEL: Record<MarketCode, { one: string; many: string }> = {
  de: { one: "Bundesland", many: "Bundesländer" },
  nl: { one: "provincie", many: "Provincies" },
  at: { one: "Bundesland", many: "Bundesländer" },
  ch: { one: "Kanton", many: "Kantone" },
};

const GUIDE_CONTENT: { topic: GuideTopic; text: string }[] = [
  { topic: "walk", text: "Parken en wandelroutes waar je samen op pad kunt en andere dierenliefhebbers ontmoet." },
  { topic: "food", text: "Ideeën voor een ontspannen eerste koffie. Vraag vooraf of je hond welkom is." },
  { topic: "vet", text: "Dierenartsen, hondenscholen, trimsalons en opvang: praktische tips voor het leven met dieren." },
  { topic: "cat", text: "Ontmoetingen en opvang voor kattenliefhebbers, want dierenliefde houdt niet op bij honden." },
];

export function NlCityHub({ market }: { market: MarketCode }) {
  const hub = getMarketPartnersucheHub(market);
  const data = getCityHubData(market);
  const config = getMarket(market);
  const regionLabel = REGION_LABEL[market];
  const registrationUrl = publicUrl(market, "/registration/?AID=location");
  const [firstSection, ...moreSections] = hub.editorial.sections;

  return (
    <main className={`tvc tvh ${display.variable}`}>
      <section className="tvc-hero tvh-hero">
        <div className="tvc-wrap tvh-hero-grid">
          <div className="tvc-hero-copy">
            <nav className="tvc-crumbs" aria-label="Broodkruimels">
              <MarketLink market={market} path="/">Home</MarketLink>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Dating</span>
            </nav>
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />Dating voor dierenliefhebbers · {config.countryName}</span>
            <h1>{hub.title}</h1>
            <p className="tvc-lead">{hub.description}</p>
            <ul className="tvh-stats">
              <li><strong>{data.totals.cities}</strong><span>Wandelgidsen</span></li>
              <li><strong>{data.totals.regions}</strong><span>{regionLabel.many}</span></li>
              <li><strong>{data.totals.chapters}</strong><span>Hoofdstukken</span></li>
            </ul>
            <div className="tvc-actions">
              <a className="tvc-btn tvc-btn-primary" href={registrationUrl}>Singles met hart voor dieren ontmoeten</a>
              <a className="tvc-btn tvc-btn-ghost" href="#staedte">Vind jouw stad <span aria-hidden="true">↓</span></a>
            </div>
            <p className="tvc-animals">
              <span>In de gidsen:</span>
              {data.totals.animals.map((animal) => <span className="tvc-animal" key={animal}><AnimalIcon animal={animal} />{ANIMAL_LABELS[animal]}</span>)}
            </p>
          </div>

          <figure className={`tvh-map tvh-map-${market}`}>
            <svg viewBox={`-10 -10 ${data.map.width + 20} ${data.map.height + 20}`} role="img" aria-label={`Kaart: stadsgidsen van tierisch-verliebt in ${config.countryName}`}>
              <defs>
                <symbol id="tvh-paw" viewBox="0 0 64 64">
                  <path d="M32 34c-8.5 0-16 8.6-16 15.2 0 4.5 3.6 6.8 8 6.8 3.3 0 5.3-1.6 8-1.6s4.7 1.6 8 1.6c4.4 0 8-2.3 8-6.8C48 42.6 40.5 34 32 34Z" />
                  <ellipse cx="13" cy="27" rx="6" ry="7.6" /><ellipse cx="24.5" cy="15" rx="6" ry="8" /><ellipse cx="39.5" cy="15" rx="6" ry="8" /><ellipse cx="51" cy="27" rx="6" ry="7.6" />
                </symbol>
                <pattern id={`tvh-dots-${market}`} width="18" height="18" patternUnits="userSpaceOnUse">
                  <circle cx="9" cy="9" r="1.6" className="tvh-map-dot" />
                </pattern>
              </defs>
              <path className="tvh-map-land" d={data.map.path} />
              <path d={data.map.path} fill={`url(#tvh-dots-${market})`} />
              {data.cities.map((city, index) => (
                <MarketLink key={city.slug} className="tvh-pin" market={market} path={city.path}>
                  <title>{`${city.name} – Wandelgids`}</title>
                  <circle className="tvh-pin-pulse" cx={city.x} cy={city.y} r="20" style={{ animationDelay: `${(index % 7) * 0.4}s` }} />
                  <circle className="tvh-pin-dot" cx={city.x} cy={city.y} r="21" />
                  <use href="#tvh-paw" x={city.x - 13} y={city.y - 14} width="26" height="26" className="tvh-pin-paw" />
                  {city.label ? <text x={city.label.x} y={city.label.y} textAnchor={city.label.anchor}>{city.name}</text> : null}
                </MarketLink>
              ))}
            </svg>
            <figcaption><PawIcon />Elke poot leidt naar een wandelgids</figcaption>
          </figure>
        </div>
      </section>

      <section id="staedte" className="tvc-wrap tvh-cities" aria-labelledby="tvh-cities-title">
        <div className="tvh-cities-panel">
          <div className="tvc-head">
            <span className="tvc-eyebrow">Stedenoverzicht</span>
            <h2 id="tvh-cities-title">Kies jouw stad – en jouw wandelgids</h2>
            <p>Ontdek wandelroutes, ideeën voor een date en praktische tips voor dierenliefhebbers in jouw stad.</p>
          </div>
          <NlCityFinder market={market} cities={data.cities} regions={data.regions} regionLabel={regionLabel.one} />
          <p className="nl-pilot-note">Deze Nederlandse pilot laat alvast zien hoe tierisch-verliebt.nl eruit gaat zien. Aanmelden en ledenprofielen volgen bij de lancering.</p>
        </div>
      </section>

      <section className="tvc-wrap tvh-inside" aria-labelledby="tvh-inside-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Met hart en poot</span>
          <h2 id="tvh-inside-title">Wat je in de wandelgidsen vindt</h2>
        </div>
        <div className="tvh-inside-grid">
          {GUIDE_CONTENT.map((entry) => (
            <div key={entry.topic} className={`tvh-inside-card tvc-t-${entry.topic}`}>
              <span className="tvc-idea-icon"><TopicIcon topic={entry.topic} /></span>
              <strong>{TOPIC_LABELS[entry.topic]}</strong>
              <p>{entry.text}</p>
              {data.totals.topicCounts[entry.topic] ? <em>in {data.totals.topicCounts[entry.topic]} van {data.totals.cities} steden</em> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="tvc-wrap nl-breeds-section"><div className="tvc-head"><span className="tvc-eyebrow">Het magazine</span><h2>Vijf hondenrassen, vijf kattenrassen</h2><p>Leer je favoriete rassen beter kennen: karakter, verzorging en het leven samen.</p></div><BreedGrid /></section>
      <section className="tvc-wrap tvh-story">
        <article className="tvh-story-card">
          <div className="tvh-story-copy">
            <span className="tvc-eyebrow">Dierenliefde in {config.countryName}</span>
            {hub.editorial.introParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <a className="tvc-btn tvc-btn-primary" href={registrationUrl}><HeartIcon />Singles ontmoeten</a>
          </div>
          {(firstSection?.imageUrl ?? hub.editorial.heroImageUrl) ? (
            <figure className="tvh-polaroid">
              <img src={(firstSection?.imageUrl ?? hub.editorial.heroImageUrl)!} alt={(firstSection?.imageUrl ? firstSection.imageAlt : hub.editorial.heroImageAlt) || hub.title} loading="lazy" decoding="async" />
              <figcaption><PawIcon />Liefde met hart en poot</figcaption>
            </figure>
          ) : null}
        </article>
        {firstSection ? (
          <div className="tvh-story-sections">
            {[firstSection, ...moreSections].map((section, index) => (
              <article key={section.heading} className="tvh-story-section">
                <span className="tvh-story-no" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h2>{section.heading}</h2>
                {section.imageUrl && index > 0 ? <img src={section.imageUrl} alt={section.imageAlt || section.heading} loading="lazy" decoding="async" /> : null}
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
