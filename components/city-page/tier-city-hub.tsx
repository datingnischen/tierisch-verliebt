import { CitySearchFallback } from "@/components/city-search-fallback";
import { MarketLink } from "@/components/market-link";
import { ANIMAL_LABELS, TOPIC_LABELS, type GuideTopic } from "@/lib/city-guide";
import { getCityHubData } from "@/lib/city-hub";
import { getMarketPartnersucheHub } from "@/lib/market-partnersuche";
import { getMarket, publicUrl, type MarketCode } from "@/lib/markets";
import { CityFinder } from "./city-finder";
import { AnimalIcon, HeartIcon, PawIcon, TopicIcon } from "./tier-icons";
import { display } from "./display-font";
import "./tier-city-page.css";
import "./tier-city-hub.css";


const REGION_LABEL: Record<MarketCode, { one: string; many: string }> = {
  de: { one: "Bundesland", many: "Bundesländer" },
  at: { one: "Bundesland", many: "Bundesländer" },
  ch: { one: "Kanton", many: "Kantone" },
};

const GUIDE_CONTENT: { topic: GuideTopic; text: string }[] = [
  { topic: "walk", text: "Hundewiesen, Freilaufflächen und Spazierwege, auf denen man anderen Tierfreunden ganz nebenbei begegnet." },
  { topic: "food", text: "Cafés und Restaurants, in denen Vierbeiner willkommen sind – ideal fürs erste Treffen." },
  { topic: "vet", text: "Tierärzte, Hundeschulen, Friseure und Pensionen: Adressen, die im Alltag mit Tier zählen." },
  { topic: "cat", text: "Treffpunkte und Betreuung für Samtpfoten – weil Tierliebe nicht beim Hund aufhört." },
];

export function TierCityHub({ market }: { market: MarketCode }) {
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
            <nav className="tvc-crumbs" aria-label="Brotkrumen">
              <MarketLink market={market} path="/">Start</MarketLink>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Partnersuche</span>
            </nav>
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />Partnersuche für Tierfreunde · {config.countryName}</span>
            <h1>{hub.title}</h1>
            <p className="tvc-lead">{hub.description}</p>
            <ul className="tvh-stats">
              <li><strong>{data.totals.cities}</strong><span>Gassi-Guides</span></li>
              <li><strong>{data.totals.regions}</strong><span>{regionLabel.many}</span></li>
              <li><strong>{data.totals.tips}</strong><span>Adressen &amp; Tipps</span></li>
            </ul>
            <div className="tvc-actions">
              <a className="tvc-btn tvc-btn-primary" href={registrationUrl}>Kostenlos tierliebe Singles finden</a>
              <a className="tvc-btn tvc-btn-ghost" href="#staedte">Deine Stadt finden <span aria-hidden="true">↓</span></a>
            </div>
            <p className="tvc-animals">
              <span>In den Guides:</span>
              {data.totals.animals.map((animal) => <span className="tvc-animal" key={animal}><AnimalIcon animal={animal} />{ANIMAL_LABELS[animal]}</span>)}
            </p>
          </div>

          <figure className={`tvh-map tvh-map-${market}`}>
            <svg viewBox={`-10 -10 ${data.map.width + 20} ${data.map.height + 20}`} role="img" aria-label={`Karte: tierisch-verliebt Stadt-Guides in ${config.countryName}`}>
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
                  <title>{`${city.name} – Gassi-Guide`}</title>
                  <circle className="tvh-pin-pulse" cx={city.x} cy={city.y} r="20" style={{ animationDelay: `${(index % 7) * 0.4}s` }} />
                  <circle className="tvh-pin-dot" cx={city.x} cy={city.y} r="21" />
                  <use href="#tvh-paw" x={city.x - 13} y={city.y - 14} width="26" height="26" className="tvh-pin-paw" />
                  {city.label ? <text x={city.label.x} y={city.label.y} textAnchor={city.label.anchor}>{city.name}</text> : null}
                </MarketLink>
              ))}
            </svg>
            <figcaption><PawIcon />Jede Pfote führt zu einem Gassi-Guide</figcaption>
          </figure>
        </div>
      </section>

      <section id="staedte" className="tvc-wrap tvh-cities" aria-labelledby="tvh-cities-title">
        <div className="tvh-cities-panel">
          <div className="tvc-head">
            <span className="tvc-eyebrow">Städteübersicht</span>
            <h2 id="tvh-cities-title">Wähle deine Stadt – und deinen Gassi-Guide</h2>
            <p>Jede Stadtseite verbindet echte Profilvorschauen mit Hundewiesen, tierfreundlichen Cafés und Adressen rund ums Tier.</p>
          </div>
          <CityFinder market={market} cities={data.cities} regions={data.regions} regionLabel={regionLabel.one} />
          <CitySearchFallback market={market} />
        </div>
      </section>

      <section className="tvc-wrap tvh-inside" aria-labelledby="tvh-inside-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Mit Herz und Pfote</span>
          <h2 id="tvh-inside-title">Was in den Gassi-Guides steckt</h2>
        </div>
        <div className="tvh-inside-grid">
          {GUIDE_CONTENT.map((entry) => (
            <div key={entry.topic} className={`tvh-inside-card tvc-t-${entry.topic}`}>
              <span className="tvc-idea-icon"><TopicIcon topic={entry.topic} /></span>
              <strong>{TOPIC_LABELS[entry.topic]}</strong>
              <p>{entry.text}</p>
              {data.totals.topicCounts[entry.topic] ? <em>in {data.totals.topicCounts[entry.topic]} von {data.totals.cities} Städten</em> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="tvc-wrap tvh-story">
        <article className="tvh-story-card">
          <div className="tvh-story-copy">
            <span className="tvc-eyebrow">Tierisch verliebt in {config.countryName}</span>
            {hub.editorial.introParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <a className="tvc-btn tvc-btn-primary" href={registrationUrl}><HeartIcon />Jetzt kostenlos anmelden</a>
          </div>
          {(firstSection?.imageUrl ?? hub.editorial.heroImageUrl) ? (
            <figure className="tvh-polaroid">
              <img src={(firstSection?.imageUrl ?? hub.editorial.heroImageUrl)!} alt={(firstSection?.imageUrl ? firstSection.imageAlt : hub.editorial.heroImageAlt) || hub.title} loading="lazy" decoding="async" />
              <figcaption><PawIcon />Liebe mit Herz und Pfote</figcaption>
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
