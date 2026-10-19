import { MarketLink } from "@/components/market-link";
import { buildCityGuide, cityGeo } from "@/lib/city-guide";
import { getItFaq, getMarketPartnersucheHub, getMarketCityPages } from "@/lib/market-partnersuche";
import { IT_PLATFORM } from "@/lib/it-routes";
import { TOPIC_LABELS } from "./copy";
import { HeartIcon, PawIcon, PinIcon, TopicIcon } from "../city-page/tier-icons";
import { display } from "../city-page/display-font";
import "../city-page/tier-city-page.css";
import "../city-page/tier-city-hub.css";

export function ItHome() {
  const hub = getMarketPartnersucheHub("it");
  const cities = getMarketCityPages("it").map((page) => {
    const guide = buildCityGuide(page);
    return { ...page, region: cityGeo("it", page.slug)?.region ?? "", chapters: guide.sections.length, topics: guide.topics.slice(0, 4) };
  });
  const faq = getItFaq();

  return (
    <main className={`tvc tvh ${display.variable}`}>
      <section className="tvc-hero tvh-hero">
        <div className="tvc-wrap tvh-hero-grid">
          <div className="tvc-hero-copy">
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />Incontri per amanti degli animali · Ticino</span>
            <h1>{hub.title}</h1>
            <p className="tvc-lead">{hub.description}</p>
            <ul className="tvh-stats">
              <li><strong>{cities.length}</strong><span>Guide cittadine</span></li>
              <li><strong>{cities.reduce((sum, city) => sum + city.chapters, 0)}</strong><span>Capitoli</span></li>
              <li><strong>0 CHF</strong><span>Iscrizione</span></li>
            </ul>
            <div className="tvc-actions">
              <a className="tvc-btn tvc-btn-primary" href={IT_PLATFORM.registrationUrl}>Iscriviti gratis</a>
              <a className="tvc-btn tvc-btn-ghost" href="#citta">Trova la tua città <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          {hub.editorial.heroImageUrl ? (
            <figure className="tvh-polaroid">
              <img src={hub.editorial.heroImageUrl} alt={hub.editorial.heroImageAlt || hub.title} fetchPriority="high" decoding="async" />
              <figcaption><PawIcon />Amore con cuore e zampa</figcaption>
            </figure>
          ) : null}
        </div>
      </section>

      <section id="citta" className="tvc-wrap tvh-cities" aria-labelledby="tvh-cities-title">
        <div className="tvh-cities-panel">
          <div className="tvc-head">
            <span className="tvc-eyebrow">Guide in Ticino</span>
            <h2 id="tvh-cities-title">Scegli la tua città</h2>
            <p>Ogni guida unisce profili reali dalla tua zona e idee per un primo incontro con il tuo animale.</p>
          </div>
          <ul className="tvh-grid">
            {cities.map((city, index) => (
              <li key={city.slug} style={{ ["--i" as string]: index }}>
                <div className="tvh-card">
                  <span className="tvh-card-media"><PawIcon /><span className="tvh-card-region"><PinIcon />{city.region}</span></span>
                  <span className="tvh-card-body">
                    <MarketLink className="card-link card-link-block" market="it" path={city.path}><small>Single che amano gli animali a</small>{" "}<strong>{city.cityName}</strong></MarketLink>
                    <span className="tvh-card-meta">{city.chapters} capitoli</span>
                    {city.topics.length ? (
                      <span className="tvh-card-topics">
                        {city.topics.map((topic) => <span key={topic} title={TOPIC_LABELS[topic]}><TopicIcon topic={topic} /><span className="tvh-sr">{TOPIC_LABELS[topic]}</span></span>)}
                      </span>
                    ) : null}
                    <span className="tvh-card-go">Alla guida <span aria-hidden="true">→</span></span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="tvc-wrap tvh-story">
        <article className="tvh-story-card">
          <div className="tvh-story-copy">
            <span className="tvc-eyebrow">Amore per gli animali in Ticino</span>
            {hub.editorial.introParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <a className="tvc-btn tvc-btn-primary" href={IT_PLATFORM.registrationUrl}><HeartIcon />Conosci single</a>
          </div>
        </article>
        <div className="tvh-story-sections">
          {hub.editorial.sections.map((section, index) => (
            <article key={section.heading} className="tvh-story-section">
              <span className="tvh-story-no" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </article>
          ))}
        </div>
      </section>

      <section className="tvc-wrap tvh-story" aria-labelledby="it-faq-title">
        <div className="tvc-head"><span className="tvc-eyebrow">Domande frequenti</span><h2 id="it-faq-title">Domande su tierisch-verliebt.ch</h2></div>
        <div className="tvh-story-sections">
          {faq.map((entry) => (
            <details key={entry.question} className="tvh-story-section">
              <summary><strong>{entry.question}</strong></summary>
              <p>{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
