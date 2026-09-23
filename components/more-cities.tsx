import { MarketLink } from "@/components/market-link";
import type { MarketCityPage } from "@/lib/market-partnersuche";
import type { MarketCode } from "@/lib/markets";
import "./more-cities.css";

type Props = { market: MarketCode; cities: MarketCityPage[]; total: number };

function PawMotif() {
  return (
    <svg className="more-cities-paw" viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="42" rx="14" ry="12" />
      <ellipse cx="14" cy="26" rx="6" ry="8" />
      <ellipse cx="25" cy="15" rx="6" ry="8" />
      <ellipse cx="39" cy="15" rx="6" ry="8" />
      <ellipse cx="50" cy="26" rx="6" ry="8" />
    </svg>
  );
}

export function MoreCities({ market, cities, total }: Props) {
  if (!cities.length) return null;
  return (
    <section className="content-section more-cities" aria-labelledby="weitere-staedte">
      <div className="more-cities-head">
        <div className="section-header">
          <span className="eyebrow">Auch in Deiner Nähe</span>
          <h2 id="weitere-staedte">Tierliebe Singles in weiteren Städten</h2>
        </div>
        <MarketLink className="more-cities-all" market={market} path="/partnersuche">
          {total > cities.length ? `Alle ${total} Städte` : "Zur Städteübersicht"} <span aria-hidden="true">→</span>
        </MarketLink>
      </div>
      <div className="more-cities-grid">
        {cities.map((city) => (
          <MarketLink key={city.slug} className={`more-cities-tile${city.imageUrl ? "" : " more-cities-tile-plain"}`} market={market} path={city.path}>
            {city.imageUrl ? <img src={city.imageUrl} alt={`Tierliebe Singles in ${city.cityName}`} loading="lazy" decoding="async" /> : <PawMotif />}
            <span className="more-cities-label"><small>Singles in</small><strong>{city.cityName}</strong></span>
            <i aria-hidden="true">→</i>
          </MarketLink>
        ))}
      </div>
    </section>
  );
}
