import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CityFinder } from "@/components/city-page/city-finder";
import { display } from "@/components/city-page/display-font";
import { AnimalIcon, PawIcon } from "@/components/city-page/tier-icons";
import { MarketLink } from "@/components/market-link";
import { ANIMAL_LABELS } from "@/lib/city-guide";
import { getCityHubData } from "@/lib/city-hub";
import { getMarket, isMarketCode, publicUrl, type RegionalMarket } from "@/lib/markets";
import "@/components/city-page/tier-city-page.css";
import "@/components/city-page/tier-city-hub.css";

type Props = { params: Promise<{ market: string }> };

function active(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export function generateStaticParams() {
  return [{ market: "at" }, { market: "ch" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const market = active((await params).market);
  const config = getMarket(market);
  return {
    title: { absolute: `tierisch-verliebt.${market} – Dating für Tierfreunde in ${config.countryName}` },
    description: `Tierliebe Singles und regionale Partnersuche in ${config.countryName}.`,
    alternates: { canonical: publicUrl(market) },
    robots: { index: true, follow: true },
  };
}

export default async function MarketHome({ params }: Props) {
  const market = active((await params).market);
  const config = getMarket(market);
  const data = getCityHubData(market);
  const regionLabel = market === "ch" ? { one: "Kanton", many: "Kantone" } : { one: "Bundesland", many: "Bundesländer" };

  return (
    <main className={`tvc tvh ${display.variable}`}>
      <section className="tvc-hero tvh-hero">
        <div className="tvc-wrap">
          <div className="tvc-hero-copy">
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />Tierliebe Partnersuche · {config.countryName}</span>
            <h1>Menschen kennenlernen, bei denen Tiere zur Familie gehören</h1>
            <p className="tvc-lead">Entdecke tierliebe Singles in {config.countryName} – mit Gassi-Guides für deine Stadt: Hundewiesen, tierfreundliche Cafés und Adressen rund ums Tier.</p>
            <ul className="tvh-stats">
              <li><strong>{data.totals.cities}</strong><span>Gassi-Guides</span></li>
              <li><strong>{data.totals.regions}</strong><span>{regionLabel.many}</span></li>
              <li><strong>{data.totals.tips}</strong><span>Adressen &amp; Tipps</span></li>
            </ul>
            <div className="tvc-actions">
              <a className="tvc-btn tvc-btn-primary" href={publicUrl(market, "/registration/?AID=location")}>Kostenlos registrieren</a>
              <a className="tvc-btn tvc-btn-ghost" href="#staedte">Deine Stadt finden <span aria-hidden="true">↓</span></a>
            </div>
            <p className="tvc-animals">
              <span>In den Guides:</span>
              {data.totals.animals.map((animal) => <span className="tvc-animal" key={animal}><AnimalIcon animal={animal} />{ANIMAL_LABELS[animal]}</span>)}
            </p>
          </div>
        </div>
      </section>

      <section id="staedte" className="tvc-wrap tvh-cities" aria-labelledby="tvh-cities-title">
        <div className="tvh-cities-panel">
          <div className="tvc-head">
            <span className="tvc-eyebrow">Gassi-Guides in {config.countryName}</span>
            <h2 id="tvh-cities-title">Wähle deine Stadt</h2>
            <p>Jede Stadtseite verbindet echte Profilvorschauen mit Tipps für Tierfreunde vor Ort. <MarketLink market={market} path="/partnersuche">Zur Städteübersicht mit Karte →</MarketLink></p>
          </div>
          <CityFinder market={market} cities={data.cities} regions={data.regions} regionLabel={regionLabel.one} />
        </div>
      </section>
    </main>
  );
}
