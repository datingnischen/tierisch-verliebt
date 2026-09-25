"use client";

import { useMemo, useState } from "react";
import { MarketLink } from "@/components/market-link";
import { TOPIC_LABELS } from "@/lib/city-guide";
import type { HubCity } from "@/lib/city-hub";
import type { MarketCode } from "@/lib/markets";
import { PawIcon, PinIcon, TopicIcon } from "./tier-icons";

type Props = { market: MarketCode; cities: HubCity[]; regions: string[]; regionLabel: string };

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");
}

export function CityFinder({ market, cities, regions, regionLabel }: Props) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | null>(null);
  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return cities.filter((city) => (!region || city.region === region) && (!q || normalize(`${city.name} ${city.region}`).includes(q)));
  }, [cities, query, region]);

  return (
    <div className="tvh-finder">
      <div className="tvh-finder-bar">
        <label className="tvh-search">
          <PawIcon />
          <span className="tvh-sr">Stadt suchen</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Stadt oder Region suchen …" autoComplete="off" />
        </label>
        <div className="tvh-regions" role="group" aria-label={`Nach ${regionLabel} filtern`}>
          <button type="button" aria-pressed={region === null} onClick={() => setRegion(null)}>Alle</button>
          {regions.map((entry) => (
            <button type="button" key={entry} aria-pressed={region === entry} onClick={() => setRegion(region === entry ? null : entry)}>{entry}</button>
          ))}
        </div>
      </div>
      <p className="tvh-count" aria-live="polite">{visible.length === cities.length ? `${cities.length} Gassi-Guides` : `${visible.length} von ${cities.length} Gassi-Guides`}</p>
      <ul className="tvh-grid">
        {visible.map((city, index) => (
          <li key={city.slug} style={{ ["--i" as string]: index }}>
            <MarketLink className="tvh-card" market={market} path={city.path}>
              <span className="tvh-card-media">
                {city.imageUrl ? <img src={city.imageUrl} alt={`Tierfreundliches ${city.name}`} loading="lazy" decoding="async" /> : <PawIcon />}
                <span className="tvh-card-region"><PinIcon />{city.region}</span>
              </span>
              <span className="tvh-card-body">
                <small>Tierliebe Singles in</small>
                <strong>{city.name}</strong>
                <span className="tvh-card-meta">{city.chapters} Kapitel{city.tips ? ` · ${city.tips} Adressen` : ""}</span>
                {city.topics.length ? (
                  <span className="tvh-card-topics">
                    {city.topics.map((topic) => <span key={topic} title={TOPIC_LABELS[topic]}><TopicIcon topic={topic} /><span className="tvh-sr">{TOPIC_LABELS[topic]}</span></span>)}
                  </span>
                ) : null}
                <span className="tvh-card-go">Zum Gassi-Guide <span aria-hidden="true">→</span></span>
              </span>
            </MarketLink>
          </li>
        ))}
      </ul>
      {!visible.length ? <p className="tvh-empty">Keine Stadtseite gefunden – probier die individuelle Suche direkt darunter.</p> : null}
    </div>
  );
}
