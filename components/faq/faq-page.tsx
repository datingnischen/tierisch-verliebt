import type { Metadata } from "next";
import { display } from "@/components/city-page/display-font";
import { PawIcon } from "@/components/city-page/tier-icons";
import { FaqBrowser } from "@/components/faq/faq-browser";
import { MarketLink } from "@/components/market-link";
import { serializeJsonLd } from "@/lib/json-ld";
import { faqBreadcrumbSchema, faqCanonical, faqPageSchema, getFaqTopics, type FaqMarket } from "@/lib/faq";
import { getMarket, publicUrl } from "@/lib/markets";
import { staticAsset } from "@/lib/static-asset";
import "@/components/city-page/tier-city-page.css";
import "@/components/city-page/tier-city-hub.css";
import "./faq.css";

const FAQ_IMAGE = staticAsset("/pages/faq.webp");
const FAQ_IMAGE_ALT = "Zwei Hundehalter im Gespräch auf einem Feldweg, ihre Hunde an der Leine – häufige Fragen zu tierisch-verliebt";

export function faqMetadata(market: FaqMarket): Metadata {
  const title = market === "ch" ? "Häufige Fragen | tierisch-verliebt.ch" : `Häufige Fragen | tierisch-verliebt.${market}`;
  const description = `Antworten zu tierisch-verliebt: Registrierung, Partnersuche in ${getMarket(market).countryName}, Magazin sowie Datenschutz und Sicherheit.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: faqCanonical(market) },
    openGraph: { title, description, url: faqCanonical(market), images: [{ url: FAQ_IMAGE, width: 1200, height: 675, alt: FAQ_IMAGE_ALT }] },
    robots: { index: true, follow: true },
  };
}

export function FaqPage({ market }: { market: FaqMarket }) {
  const topics = getFaqTopics(market);
  const total = topics.reduce((sum, topic) => sum + topic.items.length, 0);
  const schema = [faqPageSchema(market, topics), faqBreadcrumbSchema(market)];

  return (
    <main className={`tvc tvh ${display.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <section className="tvc-hero tvh-hero tvf-hero">
        <div className="tvc-wrap tvh-hero-grid">
          <div className="tvc-hero-copy">
            <nav className="tvc-crumbs" aria-label="Brotkrumen">
              <MarketLink market={market} path="/">Start</MarketLink>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Häufige Fragen</span>
            </nav>
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />Fragen &amp; Antworten</span>
            <h1>Häufige Fragen zu tierisch-verliebt</h1>
            <p className="tvc-lead">Kurze Antworten zu Registrierung, Partnersuche, Magazin sowie Datenschutz und Sicherheit.</p>
            <ul className="tvh-stats">
              <li><strong>{total}</strong><span>Antworten</span></li>
              <li><strong>{topics.length}</strong><span>Themen</span></li>
              <li><strong>0 €</strong><span>Registrierung</span></li>
            </ul>
          </div>
          <img className="tvf-hero-image" src={FAQ_IMAGE} alt={FAQ_IMAGE_ALT} width={1200} height={675} loading="eager" decoding="async" />
        </div>
      </section>

      <section className="tvc-wrap tvf-section" aria-label="Fragen und Antworten">
        <FaqBrowser market={market} topics={topics} />
      </section>

      <section className="tvc-wrap tvf-section">
        <div className="tvf-cta">
          <div>
            <h2>Finde tierliebe Singles</h2>
            <p>Die Registrierung ist kostenlos.</p>
          </div>
          <a className="tvc-btn tvc-btn-primary" href={publicUrl(market, "/registration/?AID=location")}>Kostenlos starten</a>
        </div>
      </section>
    </main>
  );
}
