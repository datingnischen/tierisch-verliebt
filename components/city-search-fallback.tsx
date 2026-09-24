import { publicUrl, type MarketCode } from "@/lib/markets";
import "./city-search-fallback.css";

type Props = { market: MarketCode };

export function citySearchUrl(market: MarketCode): string {
  return publicUrl(market, "/suche/?AID=location");
}

export function CitySearchFallback({ market }: Props) {
  return (
    <aside className="city-search-fallback" aria-labelledby="city-search-fallback-title">
      <div className="city-search-fallback-copy">
        <span className="eyebrow">Individuelle Suche</span>
        <h2 id="city-search-fallback-title">Deine Stadt fehlt? Tierfreunde gibt&apos;s überall.</h2>
        <p>
          Nicht jede Stadt hat eine eigene Seite – tierliebe Singles gibt es trotzdem auch in deiner Region. In der
          individuellen Suche legst du Ort, Umkreis und Alter selbst fest und siehst, wer in deiner Nähe sein Herz für
          Hund, Katze oder Pferd teilt.
        </p>
      </div>
      <a className="button button-primary city-search-fallback-button" href={citySearchUrl(market)}>
        Zur individuellen Suche
      </a>
    </aside>
  );
}
