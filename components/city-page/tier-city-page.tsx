import type { CSSProperties, ReactNode } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import { IconySinglesWidget } from "@/components/icony-singles-widget";
import { MarketLink } from "@/components/market-link";
import { ANIMAL_LABELS, TOPIC_LABELS, buildCityGuide, cityGeo, nearestCities, type GuideTopic } from "@/lib/city-guide";
import { getMarketCityPages, type MarketCityPage } from "@/lib/market-partnersuche";
import type { MarketCode } from "@/lib/markets";
import { AnimalIcon, ClockIcon, HeartIcon, PawIcon, PinIcon, TopicIcon } from "./tier-icons";
import "./tier-city-page.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--tvc-display" });

type Props = { market: MarketCode; city: MarketCityPage; expert?: ReactNode };

const DATE_IDEAS: { topic: GuideTopic; title: string; text: string; cta: string }[] = [
  { topic: "walk", title: "Das Gassi-Date", text: "Nebeneinander laufen statt gegenübersitzen: Bei einer gemeinsamen Runde brechen die Vierbeiner das Eis – und Gesprächsstoff gibt es an jeder Ecke.", cta: "Gassirunden ansehen" },
  { topic: "food", title: "Café-Date mit Vierbeiner", text: "Wo der Wassernapf schon bereitsteht, bleibt das erste Treffen entspannt – auch wenn Hund oder Hündin mitkommen dürfen.", cta: "Tierfreundliche Lokale" },
  { topic: "cat", title: "Für Katzenmenschen", text: "Samtpfoten bleiben lieber zu Hause. Umso schöner, wenn man sich schon beim ersten Kaffee über Kratzbaum und Eigenheiten versteht.", cta: "Tipps für Katzenfreunde" },
  { topic: "trip", title: "Ausflug zu viert", text: "Ein längerer Ausflug zeigt schnell, ob Tempo, Pausen und Tierliebe zusammenpassen – zwei Menschen, zwei Tiere, ein Tag.", cta: "Ausflugsziele ansehen" },
  { topic: "stay", title: "Wochenende mit Hund", text: "Tierfreundliche Unterkünfte machen auch den ersten gemeinsamen Kurztrip möglich, ohne dass jemand zu Hause bleiben muss.", cta: "Unterkünfte ansehen" },
  { topic: "school", title: "Kennenlernen in der Hundeschule", text: "Wer gemeinsam trainiert, lernt sich ganz nebenbei kennen – Geduld und Humor inklusive.", cta: "Hundeschulen ansehen" },
  { topic: "vet", title: "Tierservice mit Kontaktfaktor", text: "Im Wartezimmer oder beim Tierservice trifft man Menschen, die den Alltag mit Tier kennen – ein natürlicher Gesprächseinstieg.", cta: "Tierservice ansehen" },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function TierCityPage({ market, city, expert }: Props) {
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
        {city.imageUrl ? <img className="tvc-hero-img" src={city.imageUrl} alt={city.imageAlt?.trim() || `Tierfreundliches ${city.cityName}`} fetchPriority="high" decoding="async" /> : null}
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
            <nav className="tvc-crumbs" aria-label="Brotkrumen">
              <MarketLink market={market} path="/">Start</MarketLink>
              <span aria-hidden="true">›</span>
              <MarketLink market={market} path="/partnersuche">Partnersuche</MarketLink>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{city.cityName}</span>
            </nav>
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />Gassi-Guide{geo ? ` · ${geo.region}` : ""}</span>
            <h1>{city.title}</h1>
            <p className="tvc-lead">{city.description}</p>
            <div className="tvc-actions">
              <a className="tvc-btn tvc-btn-primary" href={city.registrationUrl}>Tierliebe Singles in {city.cityName} finden</a>
              <a className="tvc-btn tvc-btn-ghost" href="#guide">Zum Gassi-Guide <span aria-hidden="true">↓</span></a>
            </div>
            {guide.animals.length ? (
              <p className="tvc-animals">
                <span>Im Guide:</span>
                {guide.animals.map((animal) => <span className="tvc-animal" key={animal}><AnimalIcon animal={animal} />{ANIMAL_LABELS[animal]}</span>)}
              </p>
            ) : null}
          </div>
          <aside className="tvc-tag" aria-label={`Steckbrief ${city.cityName}`}>
            <span className="tvc-tag-hole" aria-hidden="true" />
            <span className="tvc-tag-kicker">Tierischer Steckbrief</span>
            <strong className="tvc-tag-city">{city.cityName}</strong>
            <dl className="tvc-tag-stats">
              <div><dt>Kapitel</dt><dd>{guide.sections.length || 1}</dd></div>
              {guide.tipCount ? <div><dt>Adressen</dt><dd>{guide.tipCount}</dd></div> : null}
              <div><dt>Min. Lesen</dt><dd>{guide.readingMinutes}</dd></div>
            </dl>
            {guide.topics.length ? (
              <ul className="tvc-tag-topics">
                {guide.topics.slice(0, 6).map((topic) => <li key={topic}><TopicIcon topic={topic} />{TOPIC_LABELS[topic]}</li>)}
              </ul>
            ) : null}
          </aside>
        </div>
        {guide.imageCreditUrl ? <a className="tvc-credit" href={guide.imageCreditUrl} target="_blank" rel="nofollow noopener noreferrer">Bild: {guide.imageCreditUrl.includes("pixabay") ? "Pixabay" : "Quelle"}</a> : null}
      </section>

      <div className="tvc-wrap">
        <ul className="tvc-facts">
          <li><PinIcon /><span><small>Suchort</small><strong>{city.cityName}{geo ? `, ${geo.region}` : ""}</strong></span></li>
          {nearby[0] ? <li><PawIcon /><span><small>Nächste Stadtseite</small><strong>{nearby[0].cityName} · {nearby[0].km} km</strong></span></li> : null}
          <li><ClockIcon /><span><small>Lesezeit Guide</small><strong>ca. {guide.readingMinutes} Minuten</strong></span></li>
          <li><HeartIcon /><span><small>Anmeldung</small><strong>kostenlos</strong></span></li>
        </ul>
      </div>

      <div className="tvc-wrap tvc-widget">
        <IconySinglesWidget city={city.cityName} zip={city.icony.zip} country={city.icony.country} platformId={city.icony.platformId} registrationUrl={city.registrationUrl} searchUrl={city.searchUrl} />
      </div>

      {ideas.length >= 2 ? (
        <section className="tvc-wrap tvc-ideas" aria-labelledby="tvc-ideas-title">
          <div className="tvc-head">
            <span className="tvc-eyebrow">Mit Herz und Pfote</span>
            <h2 id="tvc-ideas-title">Date-Ideen mit Tier in {city.cityName}</h2>
            <p>Aus unserem Stadt-Guide abgeleitet: Orte, an denen sich Tierfreunde ganz natürlich begegnen.</p>
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

      <section id="guide" className="tvc-wrap tvc-guide" aria-label={`Gassi-Guide für ${city.cityName}`}>
        {guide.sections.length > 1 ? (
          <aside className="tvc-toc">
            <span className="tvc-toc-kicker"><PawIcon />Gassi-Guide</span>
            <strong>Tierfreundliches {city.cityName}</strong>
            <ol>
              {guide.sections.map((section, index) => (
                <li key={section.id}><a href={`#${section.id}`}><TopicIcon topic={section.topic} /><span>{section.heading}</span><small>{pad(index + 1)}</small></a></li>
              ))}
            </ol>
            <a className="tvc-btn tvc-btn-primary tvc-toc-cta" href={city.registrationUrl}>Tierfreunde kennenlernen</a>
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
            <span className="tvc-eyebrow">Gassi-Nachbarn</span>
            <h2 id="tvc-near-title">Tierfreunde in Reichweite</h2>
            <p>Die nächsten Stadtseiten, gemessen in Luftlinie ab {city.cityName}.</p>
          </div>
          <ol className="tvc-near-list">
            {nearby.map((entry) => (
              <li key={entry.slug}>
                <MarketLink className="tvc-near-row" market={market} path={entry.path}>
                  {entry.imageUrl ? <img src={entry.imageUrl} alt="" loading="lazy" decoding="async" /> : <span className="tvc-near-ph"><PawIcon /></span>}
                  <span className="tvc-near-name"><small>Tierliebe Singles in</small><strong>{entry.cityName}</strong></span>
                  <span className="tvc-near-bar" aria-hidden="true"><i style={{ width: `${Math.max(18, (entry.km / maxKm) * 100)}%` }} /></span>
                  <span className="tvc-near-km">{entry.km} km</span>
                </MarketLink>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="tvc-wrap tvc-related" aria-labelledby="tvc-related-title">
        <h2 id="tvc-related-title">Diese Städte könnten auch interessant für dich sein:</h2>
        <ul>
          {related.map((link) => <li key={link.path}><MarketLink market={market} path={link.path}><PawIcon />{link.name}</MarketLink></li>)}
          <li><MarketLink className="tvc-related-all" market={market} path="/partnersuche">Alle {pages.length} Städte <span aria-hidden="true">→</span></MarketLink></li>
        </ul>
      </section>

      {expert ? <div className="tvc-wrap tvc-expert">{expert}</div> : null}
    </main>
  );
}
