import type { ItCityGuide } from "@/lib/market-partnersuche";
import { ClockIcon, DogIcon, HeartIcon, PawIcon, PinIcon, TreeIcon, VetIcon } from "../city-page/tier-icons";
import "./it-city-guide.css";

function External({ href, children }: { href?: string | null; children: React.ReactNode }) {
  return href ? <a href={href} rel="noopener">{children}</a> : <>{children}</>;
}

/** Kennzahlenleiste direkt unter dem Hero: Einwohner, Haushalte, Ledige, Tierbezug. */
export function ItCityFacts({ city, guide }: { city: string; guide: ItCityGuide }) {
  return (
    <section className="tvc-wrap itg-facts" aria-labelledby="itg-facts-title">
      <h2 id="itg-facts-title" className="itg-facts-title">{city} in cifre</h2>
      <dl>
        {guide.facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd><strong>{fact.value}</strong><small>{fact.note}</small></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Stadtführer mit belegten Orten, Regeln, Terminen und Bahnzeiten. */
export function ItCityGuideSections({ city, guide }: { city: string; guide: ItCityGuide }) {
  return (
    <>
      <section className="tvc-wrap itg-block" aria-labelledby="itg-dogs-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Cani liberi e al guinzaglio</span>
          <h2 id="itg-dogs-title">Aree cani e regole a {city}</h2>
          <p>Dove il cane può correre e cosa prevedono Comune e Cantone.</p>
        </div>
        <div className="itg-split">
          <ul className="itg-cards">
            {guide.dogAreas.map((area) => (
              <li key={area.name} className="itg-card">
                <span className="itg-icon itg-green"><DogIcon /></span>
                <strong><External href={area.url}>{area.name}</External></strong>
                <small className="itg-where"><PinIcon />{area.address}</small>
                <p>{area.text}</p>
              </li>
            ))}
          </ul>
          <ol className="itg-rules">
            {guide.rules.map((rule) => (
              <li key={rule.title}>
                <strong>{rule.title}</strong>
                <p>{rule.text}{rule.url ? <> <a href={rule.url} rel="noopener">Fonte</a></> : null}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tvc-wrap itg-block" aria-labelledby="itg-walks-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Primo incontro all&apos;aperto</span>
          <h2 id="itg-walks-title">Passeggiate e luoghi d&apos;incontro con il cane</h2>
          <p>Percorsi e posti in cui un primo appuntamento con il cane è semplice, con le regole del luogo.</p>
        </div>
        <ul className="itg-cards itg-cards-3">
          {guide.walks.map((walk) => (
            <li key={walk.name} className="itg-card">
              <span className="itg-icon itg-green"><TreeIcon /></span>
              <strong><External href={walk.url}>{walk.name}</External></strong>
              <small className="itg-where"><PinIcon />{walk.where}</small>
              <p>{walk.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="tvc-wrap itg-block" aria-labelledby="itg-help-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Protezione animali</span>
          <h2 id="itg-help-title">Rifugi, protezione animali e veterinario d&apos;urgenza</h2>
          <p>Indirizzi utili per chi vuole adottare, aiutare o ha bisogno di assistenza fuori orario.</p>
        </div>
        <ul className="itg-cards">
          {guide.shelters.map((shelter) => (
            <li key={shelter.name} className="itg-card">
              <span className="itg-icon itg-red"><HeartIcon /></span>
              <strong><External href={shelter.url}>{shelter.name}</External></strong>
              <small className="itg-where"><PinIcon />{shelter.address}</small>
              <p>{shelter.text}</p>
            </li>
          ))}
          <li className="itg-card itg-card-vet">
            <span className="itg-icon itg-sky"><VetIcon /></span>
            <strong>Veterinario d&apos;urgenza</strong>
            <p>{guide.vet.text}{guide.vet.url ? <> <a href={guide.vet.url} rel="noopener">Fonte</a></> : null}</p>
          </li>
        </ul>
      </section>

      <section className="tvc-wrap itg-block" aria-labelledby="itg-events-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Durante l&apos;anno</span>
          <h2 id="itg-events-title">Appuntamenti con gli animali</h2>
          <p>Date ricorrenti a {city} e nei dintorni. Il programma esatto va verificato ogni anno presso l&apos;organizzatore.</p>
        </div>
        <ol className="itg-events">
          {guide.events.map((event) => (
            <li key={event.name}>
              <span className="itg-when"><ClockIcon />{event.when}</span>
              <strong><External href={event.url}>{event.name}</External></strong>
              <p>{event.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="tvc-wrap itg-block" aria-labelledby="itg-train-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">In treno con il cane</span>
          <h2 id="itg-train-title">Da {city} alle altre città ticinesi</h2>
          <p>{guide.trainNote}</p>
        </div>
        <ul className="itg-train">
          {guide.transport.map((train) => (
            <li key={train.to}>
              <span className="itg-train-min"><strong>{train.minutes}</strong> min</span>
              <span><strong>{train.to}</strong><small>{train.text}</small></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="tvc-wrap itg-block" aria-labelledby="itg-faq-title">
        <div className="tvc-head">
          <span className="tvc-eyebrow">Domande frequenti</span>
          <h2 id="itg-faq-title">Domande su {city} con il cane</h2>
        </div>
        <div className="itg-faq">
          {guide.faq.map((entry) => (
            <details key={entry.question}>
              <summary><PawIcon />{entry.question}</summary>
              <p>{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

/** Quellen eingeklappt am Seitenende (details ohne open, 13 px). */
export function ItCitySources({ guide }: { guide: ItCityGuide }) {
  return (
    <div className="tvc-wrap">
      <details className="itg-sources">
        <summary>Fonti e verifiche ({guide.sources.length})</summary>
        <p>Dati verificati il {guide.checked}. Regole e orari possono cambiare: fa fede l&apos;indicazione ufficiale sul posto.</p>
        <ul>
          {guide.sources.map((source) => <li key={source.url}><a href={source.url} rel="noopener">{source.title}</a></li>)}
        </ul>
      </details>
    </div>
  );
}
