import type { CSSProperties, ReactNode } from "react";

import { MarketLink } from "@/components/market-link";
import { buildCityGuide, cityGeo, nearestCities, type GuideTopic } from "@/lib/city-guide";
import { ANIMAL_LABELS, TOPIC_LABELS } from "./copy";
import { getMarketCityPages, type MarketCityPage } from "@/lib/market-partnersuche";
import type { MarketCode } from "@/lib/markets";
import { AnimalIcon, ClockIcon, HeartIcon, PawIcon, PinIcon, TopicIcon } from "../city-page/tier-icons";
import { display } from "../city-page/display-font";
import "../city-page/tier-city-page.css";


type Props = { market: MarketCode; city: MarketCityPage; expert?: ReactNode };

const DATE_IDEAS: { topic: GuideTopic; title: string; text: string; cta: string }[] = [
  { topic: "walk", title: "Een wandeldate", text: "Samen wandelen in plaats van tegenover elkaar zitten: je hond breekt het ijs en onderweg is er altijd iets om over te praten.", cta: "Bekijk de wandelroutes" },
  { topic: "food", title: "Koffiedate met je hond", text: "Een rustig terras maakt een eerste ontmoeting ontspannen. Vraag vooraf of je hond mee mag en neem water mee.", cta: "Tips voor een koffiedate" },
  { topic: "cat", title: "Voor kattenliefhebbers", text: "Katten blijven vaak liever thuis. Hoe fijn is het als je bij de eerste koffie al begrijpt wat die krabpaal en eigen gewoontes voor de ander betekenen.", cta: "Tips voor kattenliefhebbers" },
  { topic: "trip", title: "Samen een dag op pad", text: "Een langere wandeling laat zien of jullie tempo, pauzes en dierenliefde bij elkaar passen: samen op pad met jullie dieren.", cta: "Bekijk de uitstapjes" },
  { topic: "stay", title: "Een weekend met je hond", text: "Met een diervriendelijke accommodatie kan je hond mee op jullie eerste korte reis. Controleer vooraf de voorwaarden.", cta: "Tips voor overnachten" },
  { topic: "school", title: "Ontmoetingen op de hondenschool", text: "Wie samen traint, leert elkaar vanzelf kennen. Met geduld en een beetje humor ontstaat er al snel een gesprek.", cta: "Tips voor hondenscholen" },
  { topic: "vet", title: "Contact via dierenzorg", text: "Bij dierenzorg ontmoet je mensen die het leven met een huisdier begrijpen. Dat levert vaak een vanzelfsprekend gesprek op.", cta: "Tips voor dierenzorg" },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function NlCityPage({ market, city, expert }: Props) {
  const guide = buildCityGuide(city);
  const pages = getMarketCityPages(market);
  const geo = cityGeo(market, city.slug);
  const nearby = nearestCities(market, city.slug, pages, 5);
  const maxKm = Math.max(...nearby.map((entry) => entry.km), 1);
  const related = guide.related.length ? guide.related : nearby.map((entry) => ({ name: entry.cityName, path: entry.path }));
  const ideas = DATE_IDEAS.map((idea) => ({ ...idea, section: guide.sections.find((section) => section.topic === idea.topic) }))
    .filter((idea) => idea.section)
    .slice(0, 4);

  return (
    <main className={`tvc ${display.variable}`}>
      <section className="tvc-hero">
        {city.imageUrl ? <img className="tvc-hero-img" src={city.imageUrl} alt={city.imageAlt?.trim() || `Dierenliefde in ${city.cityName}`} fetchPriority="high" decoding="async" /> : null}
        <svg className="tvc-trail" viewBox="0 0 1200 220" aria-hidden="true" preserveAspectRatio="none">
          {Array.from({ length: 11 }, (_, index) => (
            <use key={index} href="#tvc-paw" x={40 + index * 108} y={index % 2 ? 150 : 110} width="34" height="34" transform={`rotate(${index % 2 ? 78 : 102} ${57 + index * 108} ${index % 2 ? 167 : 127})`} style={{ animationDelay: `${index * 0.18}s` }} />
          ))}
          <defs>
            <symbol id="tvc-paw" viewBox="0 0 64 64">
              <path fill="currentColor" d="M32 34c-8.5 0-16 8.6-16 15.2 0 4.5 3.6 6.8 8 6.8 3.3 0 5.3-1.6 8-1.6s4.7 1.6 8 1.6c4.4 0 8-2.3 8-6.8C48 42.6 40.5 34 32 34Z" />
              <ellipse fill="currentColor" cx="13" cy="27" rx="6" ry="7.6" /><ellipse fill="currentColor" cx="24.5" cy="15" rx="6" ry="8" /><ellipse fill="currentColor" cx="39.5" cy="15" rx="6" ry="8" /><ellipse fill="currentColor" cx="51" cy="27" rx="6" ry="7.6" />
            </symbol>
          </defs>
        </svg>
        <div className="tvc-wrap tvc-hero-grid">
          <div className="tvc-hero-copy">
            <nav className="tvc-crumbs" aria-label="Broodkruimels">
              <MarketLink market={market} path="/">Home</MarketLink>
              <span aria-hidden="true">›</span>
              <MarketLink market={market} path="/partnersuche">Dating</MarketLink>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{city.cityName}</span>
            </nav>
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />Wandelgids{geo ? ` · ${geo.region}` : ""}</span>
            <h1>{city.title}</h1>
            <p className="tvc-lead">{city.description}</p>
            <div className="tvc-actions">
              <a className="tvc-btn tvc-btn-primary" href={city.registrationUrl}>Singles met hart voor dieren in {city.cityName} ontmoeten</a>
              <a className="tvc-btn tvc-btn-ghost" href="#guide">Naar de wandelgids <span aria-hidden="true">↓</span></a>
            </div>
            {guide.animals.length ? (
              <p className="tvc-animals">
                <span>In deze gids:</span>
                {guide.animals.map((animal) => <span className="tvc-animal" key={animal}><AnimalIcon animal={animal} />{ANIMAL_LABELS[animal]}</span>)}
              </p>
            ) : null}
          </div>
          <aside className="tvc-tag" aria-label={`In het kort: ${city.cityName}`}>
            <span className="tvc-tag-hole" aria-hidden="true" />
            <span className="tvc-tag-kicker">Dierenliefde in het kort</span>
            <strong className="tvc-tag-city">{city.cityName}</strong>
            <dl className="tvc-tag-stats">
              <div><dt>Hoofdstukken</dt><dd>{guide.sections.length || 1}</dd></div>
              {guide.tipCount ? <div><dt>Tips</dt><dd>{guide.tipCount}</dd></div> : null}
              <div><dt>Min. lezen</dt><dd>{guide.readingMinutes}</dd></div>
            </dl>
            {guide.topics.length ? (
              <ul className="tvc-tag-topics">
                {guide.topics.slice(0, 6).map((topic) => <li key={topic}><TopicIcon topic={topic} />{TOPIC_LABELS[topic]}</li>)}
              </ul>
            ) : null}
          </aside>
        </div>
        {city.imageIsGenerated ? <span className="tvc-credit">Beeld: AI-gegenereerde stadsimpressie</span> : guide.imageCreditUrl ? <a className="tvc-credit" href={guide.imageCreditUrl} target="_blank" rel="nofollow noopener noreferrer">Foto: {guide.imageCreditUrl.includes("pixabay") ? "Pixabay" : "Bron"}</a> : null}
      </section>

      <div className="tvc-wrap">
        <ul className="tvc-facts">
          <li><PinIcon /><span><small>Locatie</small><strong>{city.cityName}{geo ? `, ${geo.region}` : ""}</strong></span></li>
          {nearby[0] ? <li><PawIcon /><span><small>Dichtstbijzijnde stad</small><strong>{nearby[0].cityName} · {nearby[0].km} km</strong></span></li> : null}
          <li><ClockIcon /><span><small>Leestijd</small><strong>ongeveer {guide.readingMinutes} minuten</strong></span></li>
          <li><HeartIcon /><span><small>Aanmelden</small><strong>bij de lancering</strong></span></li>
        </ul>
      </div>

      <div className="tvc-wrap tvc-widget">
        <section className="nl-profile-placeholder"><PawIcon /><h2>Singles met hart voor dieren in {city.cityName}</h2><p>Het Nederlandse ledenplatform opent bij de lancering. Tot die tijd kun je alvast onze stadsgids en het magazine ontdekken.</p><MarketLink market="nl" path="/magazin">Ontdek het magazine →</MarketLink></section>
      </div>

      {ideas.length >= 2 ? (
        <section className="tvc-wrap tvc-ideas" aria-labelledby="tvc-ideas-title">
          <div className="tvc-head">
            <span className="tvc-eyebrow">Met hart en poot</span>
            <h2 id="tvc-ideas-title">Date-ideeën met je huisdier in {city.cityName}</h2>
            <p>Ideeën uit onze stadsgids: zo leren dierenliefhebbers elkaar op een ontspannen manier kennen.</p>
          </div>
          <div className="tvc-ideas-grid">
            {ideas.map((idea, index) => (
              <a key={idea.topic} className={`tvc-idea tvc-t-${idea.topic}`} href={`#${idea.section!.id}`} style={{ "--tilt": `${index % 2 ? 1.2 : -1.2}deg` } as CSSProperties}>
                <span className="tvc-idea-icon"><TopicIcon topic={idea.topic} /></span>
                <strong>{idea.title}</strong>
                <span>{idea.text}</span>
                <em>{idea.cta} <span aria-hidden="true">→</span></em>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section id="guide" className="tvc-wrap tvc-guide" aria-label={`Wandelgids voor ${city.cityName}`}>
        {guide.sections.length > 1 ? (
          <aside className="tvc-toc">
            <span className="tvc-toc-kicker"><PawIcon />Wandelgids</span>
            <strong>Dierenliefde in {city.cityName}</strong>
            <ol>
              {guide.sections.map((section, index) => (
                <li key={section.id}><a href={`#${section.id}`}><TopicIcon topic={section.topic} /><span>{section.heading}</span><small>{pad(index + 1)}</small></a></li>
              ))}
            </ol>
            <a className="tvc-btn tvc-btn-primary tvc-toc-cta" href={city.registrationUrl}>Dierenliefhebbers ontmoeten</a>
          </aside>
        ) : null}
        <div className="tvc-chapters">
          {guide.introHtml ? <article className="tvc-chapter tvc-intro"><div className="rich-content tvc-rich" dangerouslySetInnerHTML={{ __html: guide.introHtml }} /></article> : null}
          {guide.sections.map((section, index) => (
            <article key={section.id} id={section.id} className={`tvc-chapter tvc-t-${section.topic}`}>
              <header>
                <span className="tvc-chapter-icon"><TopicIcon topic={section.topic} /></span>
                <span className="tvc-chapter-no" aria-hidden="true">{pad(index + 1)}</span>
                <span className="tvc-chapter-kicker">{TOPIC_LABELS[section.topic]}</span>
                <h2>{section.heading}</h2>
              </header>
              {section.html ? <div className="rich-content tvc-rich" dangerouslySetInnerHTML={{ __html: section.html }} /> : null}
            </article>
          ))}
        </div>
      </section>

      {nearby.length ? (
        <section className="tvc-wrap tvc-near" aria-labelledby="tvc-near-title">
          <div className="tvc-head">
            <span className="tvc-eyebrow">Steden in de buurt</span>
            <h2 id="tvc-near-title">Andere steden in de buurt</h2>
            <p>De dichtstbijzijnde stadsgidsen, hemelsbreed vanaf {city.cityName}.</p>
          </div>
          <ol className="tvc-near-list">
            {nearby.map((entry) => (
              <li key={entry.slug}>
                <MarketLink className="tvc-near-row" market={market} path={entry.path}>
                  {entry.imageUrl ? <img src={entry.imageUrl} alt={entry.imageAlt || `Dating in ${entry.cityName}`} loading="lazy" decoding="async" /> : <span className="tvc-near-ph"><PawIcon /></span>}
                  <span className="tvc-near-name"><small>Singles met hart voor dieren in</small><strong>{entry.cityName}</strong></span>
                  <span className="tvc-near-bar" aria-hidden="true"><i style={{ width: `${Math.max(18, (entry.km / maxKm) * 100)}%` }} /></span>
                  <span className="tvc-near-km">{entry.km} km</span>
                </MarketLink>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="tvc-wrap tvc-related" aria-labelledby="tvc-related-title">
        <h2 id="tvc-related-title">Misschien vind je deze steden ook interessant:</h2>
        <ul>
          {related.map((link) => <li key={link.path}><MarketLink market={market} path={link.path}><PawIcon />{link.name}</MarketLink></li>)}
          <li><MarketLink className="tvc-related-all" market={market} path="/partnersuche">Alle {pages.length} steden <span aria-hidden="true">→</span></MarketLink></li>
        </ul>
      </section>

      {expert ? <div className="tvc-wrap tvc-expert">{expert}</div> : null}
    </main>
  );
}
