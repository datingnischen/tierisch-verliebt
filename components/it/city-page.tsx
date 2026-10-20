import type { CSSProperties } from "react";

import { IconySinglesWidget } from "@/components/icony-singles-widget";
import { MarketLink } from "@/components/market-link";
import { buildCityGuide, cityGeo, nearestCities, type GuideTopic } from "@/lib/city-guide";
import { getItCityGuide, getMarketCityPages, type MarketCityPage } from "@/lib/market-partnersuche";
import { ItCityFacts, ItCityGuideSections, ItCitySources } from "./city-guide";
import { ANIMAL_LABELS, TOPIC_LABELS } from "./copy";
import { AnimalIcon, ClockIcon, HeartIcon, PawIcon, PinIcon, TopicIcon } from "../city-page/tier-icons";
import { display } from "../city-page/display-font";
import "../city-page/tier-city-page.css";

const DATE_IDEAS: { topic: GuideTopic; title: string; text: string; cta: string }[] = [
  { topic: "walk", title: "Un appuntamento passeggiando", text: "Camminare fianco a fianco invece di stare seduti uno di fronte all'altro: il cane rompe il ghiaccio e c'è sempre qualcosa di cui parlare.", cta: "Idee per passeggiare" },
  { topic: "food", title: "Un caffè con il cane", text: "Una terrazza tranquilla rende il primo incontro più rilassato. Chiedi prima se il cane è benvenuto e porta acqua.", cta: "Consigli per il caffè" },
  { topic: "cat", title: "Per chi ama i gatti", text: "I gatti preferiscono restare a casa. Che bello quando l'altra persona capisce già al primo caffè cosa significano tiragraffi e abitudini.", cta: "Consigli per chi ama i gatti" },
  { topic: "trip", title: "Una giornata insieme", text: "Una gita più lunga mostra se ritmo, pause e amore per gli animali vanno d'accordo.", cta: "Idee per le gite" },
  { topic: "vet", title: "Regole e servizi", text: "Sapere quali regole valgono per i cani evita sorprese al primo appuntamento.", cta: "Regole e servizi" },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function ItCityPage({ city }: { city: MarketCityPage }) {
  const market = "it" as const;
  const guide = buildCityGuide(city);
  const facts = getItCityGuide(city.slug);
  const pages = getMarketCityPages(market);
  const geo = cityGeo(market, city.slug);
  const nearby = nearestCities(market, city.slug, pages, 4);
  const maxKm = Math.max(...nearby.map((entry) => entry.km), 1);
  const ideas = DATE_IDEAS.map((idea) => ({ ...idea, section: guide.sections.find((section) => section.topic === idea.topic) }))
    .filter((idea) => idea.section)
    .slice(0, 4);

  return (
    <main className={`tvc ${display.variable}`}>
      <section className="tvc-hero">
        <div className="tvc-wrap tvc-hero-grid">
          <div className="tvc-hero-copy">
            <nav className="tvc-crumbs" aria-label="Percorso di navigazione">
              <MarketLink market={market} path="/">Svizzera italiana</MarketLink>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{city.cityName}</span>
            </nav>
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />Guida per amanti degli animali{geo ? ` · ${geo.region}` : ""}</span>
            <h1>{city.title}</h1>
            <p className="tvc-lead">{city.lead}</p>
            <div className="tvc-actions">
              <a className="tvc-btn tvc-btn-primary" href={city.registrationUrl}>Conosci single a {city.cityName}</a>
              <a className="tvc-btn tvc-btn-ghost" href="#guida">Alla guida <span aria-hidden="true">↓</span></a>
            </div>
            {guide.animals.length ? (
              <p className="tvc-animals">
                <span>In questa guida:</span>
                {guide.animals.map((animal) => <span className="tvc-animal" key={animal}><AnimalIcon animal={animal} />{ANIMAL_LABELS[animal]}</span>)}
              </p>
            ) : null}
          </div>
          <aside className="tvc-tag" aria-label={`In breve: ${city.cityName}`}>
            <span className="tvc-tag-hole" aria-hidden="true" />
            <span className="tvc-tag-kicker">Amore per gli animali in breve</span>
            <strong className="tvc-tag-city">{city.cityName}</strong>
            <dl className="tvc-tag-stats">
              <div><dt>Capitoli</dt><dd>{guide.sections.length || 1}</dd></div>
              <div><dt>Min. di lettura</dt><dd>{guide.readingMinutes}</dd></div>
            </dl>
            {guide.topics.length ? (
              <ul className="tvc-tag-topics">
                {guide.topics.slice(0, 6).map((topic) => <li key={topic}><TopicIcon topic={topic} />{TOPIC_LABELS[topic]}</li>)}
              </ul>
            ) : null}
          </aside>
        </div>
      </section>

      {facts ? <ItCityFacts city={city.cityName} guide={facts} /> : (
      <div className="tvc-wrap">
        <ul className="tvc-facts">
          <li><PinIcon /><span><small>Luogo</small><strong>{city.cityName}{geo ? `, ${geo.region}` : ""}</strong></span></li>
          {nearby[0] ? <li><PawIcon /><span><small>Città più vicina</small><strong>{nearby[0].cityName} · {nearby[0].km} km</strong></span></li> : null}
          <li><ClockIcon /><span><small>Lettura</small><strong>circa {guide.readingMinutes} minuti</strong></span></li>
          <li><HeartIcon /><span><small>Iscrizione</small><strong>gratuita</strong></span></li>
        </ul>
      </div>
      )}

      <div className="tvc-wrap tvc-widget">
        <IconySinglesWidget locale="it" city={city.cityName} zip={city.icony.zip} country={city.icony.country} platformId={city.icony.platformId} registrationUrl={city.registrationUrl} searchUrl={city.searchUrl} />
      </div>

      {ideas.length >= 2 ? (
        <section className="tvc-wrap tvc-ideas" aria-labelledby="tvc-ideas-title">
          <div className="tvc-head">
            <span className="tvc-eyebrow">Con cuore e zampa</span>
            <h2 id="tvc-ideas-title">Idee per un appuntamento a {city.cityName}</h2>
            <p>Dalla nostra guida: così chi ama gli animali si conosce in modo rilassato.</p>
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

      <section id="guida" className="tvc-wrap tvc-guide" aria-label={`Guida per ${city.cityName}`}>
        {guide.sections.length > 1 ? (
          <aside className="tvc-toc">
            <span className="tvc-toc-kicker"><PawIcon />Guida</span>
            <strong>Amore per gli animali a {city.cityName}</strong>
            <ol>
              {guide.sections.map((section, index) => (
                <li key={section.id}><a href={`#${section.id}`}><TopicIcon topic={section.topic} /><span>{section.heading}</span><small>{pad(index + 1)}</small></a></li>
              ))}
            </ol>
            <a className="tvc-btn tvc-btn-primary tvc-toc-cta" href={city.registrationUrl}>Iscriviti gratis</a>
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

      {facts ? <ItCityGuideSections city={city.cityName} guide={facts} /> : null}

      {nearby.length ? (
        <section className="tvc-wrap tvc-near" aria-labelledby="tvc-near-title">
          <div className="tvc-head">
            <span className="tvc-eyebrow">Città vicine</span>
            <h2 id="tvc-near-title">Altre città in Ticino</h2>
            <p>Le guide più vicine, in linea d&apos;aria da {city.cityName}.</p>
          </div>
          <ol className="tvc-near-list">
            {nearby.map((entry) => (
              <li key={entry.slug}>
                <MarketLink className="tvc-near-row" market={market} path={entry.path}>
                  <span className="tvc-near-ph"><PawIcon /></span>
                  <span className="tvc-near-name"><small>Single che amano gli animali a</small><strong>{entry.cityName}</strong></span>
                  <span className="tvc-near-bar" aria-hidden="true"><i style={{ width: `${Math.max(18, (entry.km / maxKm) * 100)}%` }} /></span>
                  <span className="tvc-near-km">{entry.km} km</span>
                </MarketLink>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {facts ? <ItCitySources guide={facts} /> : null}
    </main>
  );
}
