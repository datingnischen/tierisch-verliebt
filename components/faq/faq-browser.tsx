"use client";

import { useMemo, useState } from "react";
import { MarketLink } from "@/components/market-link";
import { publicUrl } from "@/lib/markets";
import type { FaqLink, FaqMarket, FaqTopic } from "@/lib/faq";

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function FaqAnchor({ market, link }: { market: FaqMarket; link: FaqLink }) {
  if (link.platform) return <a href={publicUrl(market, link.path)}>{link.label}</a>;
  if (link.deOnly && market !== "de") return <a href={publicUrl("de", link.path)}>{link.label}</a>;
  return <MarketLink market={market} path={link.path}>{link.label}</MarketLink>;
}

export function FaqBrowser({ market, topics }: { market: FaqMarket; topics: FaqTopic[] }) {
  const [query, setQuery] = useState("");
  const needle = normalize(query.trim());

  const visible = useMemo(
    () =>
      topics
        .map((topic) => ({
          ...topic,
          items: needle
            ? topic.items.filter((item) => normalize(`${item.question} ${item.answer}`).includes(needle))
            : topic.items,
        }))
        .filter((topic) => topic.items.length > 0),
    [topics, needle],
  );
  const count = visible.reduce((sum, topic) => sum + topic.items.length, 0);

  return (
    <div className="tvf">
      <div className="tvf-search">
        <label htmlFor="tvf-q">Fragen durchsuchen</label>
        <input
          id="tvf-q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="z. B. Registrierung, Gassi-Guide, Datenschutz"
          autoComplete="off"
        />
        <p className="tvf-count" aria-live="polite">
          {needle ? `${count} Treffer` : `${topics.reduce((sum, topic) => sum + topic.items.length, 0)} Fragen in ${topics.length} Themen`}
        </p>
      </div>

      <nav className="tvf-nav" aria-label="Themen">
        {topics.map((topic) => (
          <a key={topic.id} href={`#${topic.id}`}>{topic.title}</a>
        ))}
      </nav>

      {visible.map((topic) => (
        <section key={topic.id} id={topic.id} className="tvf-topic" aria-labelledby={`${topic.id}-h`}>
          <h2 id={`${topic.id}-h`}>{topic.title}</h2>
          {topic.items.map((item) => (
            <details key={`${item.question}-${needle}`} className="tvf-item" open={Boolean(needle)}>
              <summary>{item.question}</summary>
              <div className="tvf-answer">
                <p>{item.answer}</p>
                {item.links?.length ? (
                  <p className="tvf-links">
                    {item.links.map((link) => <FaqAnchor key={link.label} market={market} link={link} />)}
                  </p>
                ) : null}
              </div>
            </details>
          ))}
        </section>
      ))}

      {count === 0 ? (
        <p className="tvf-empty">
          Dazu gibt es keine Antwort in dieser Liste. Weitere Hilfe bekommst du über das <a href={publicUrl(market, "/impressum.html")}>Impressum</a> der Plattform.
        </p>
      ) : null}
    </div>
  );
}
