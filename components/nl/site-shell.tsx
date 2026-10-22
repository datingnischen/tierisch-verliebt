"use client";

import { usePathname } from "next/navigation";
import { MarketLink } from "@/components/market-link";
import { MarketFlag, MenuMarketFlag } from "@/components/market-flag";
import { getMarket, publicUrl } from "@/lib/markets";
import { staticAsset } from "@/lib/static-asset";
import { NL_BREEDS, NL_PLATFORM, NL_PLATFORM_DUTCH, nlRegistrationUrl } from "@/lib/nl-routes";

const COUNTRY_NL = { de: "Duitsland", at: "Oostenrijk", ch: "Zwitserland" } as const;

/** Logo wie DE/AT/CH (Myriad Pro, Endung .nl, niederländischer Claim); helle Fassung im dunklen Footer. */
function Brand({ light = false }: { light?: boolean }) {
  return <MarketLink market="nl" path="/" className={light ? "tv-footer-logo nl-brand" : "brand-lockup brand-lockup-header nl-brand"}>
    <img className={light ? undefined : "brand-logo-image"} src={staticAsset(`/brand/tierisch-verliebt-logo-${light ? "light-" : ""}nl.svg`)} alt="tierisch-verliebt.nl Logo" width="216" height="80"/>
  </MarketLink>;
}

export function NlHeader() {
  const items = [{ label: "Home", path: "/" }, { label: "Dating", path: "/partnersuche" }, { label: "Magazine", path: "/magazin" }, { label: "Hondenrassen", path: "/magazin/hondenrassen" }, { label: "Kattenrassen", path: "/magazin/kattenrassen" }, { label: "Over ons", path: "/over-ons" }];
  return <><header className="site-header-shell"><div className="site-header-bar compact-header-bar"><Brand />
    <div className="header-actions compact-header-actions" aria-label="Je account">
      <a className="login-link" href={NL_PLATFORM.loginUrl}>Inloggen</a>
      <a className="header-register header-register-primary" href={nlRegistrationUrl("location")}>Aanmelden</a>
      <details className="header-menu"><summary aria-label="Menu openen"><span className="menu-icon" aria-hidden="true"><span/><span/><span/></span><span className="sr-only">Menu</span></summary>
        <div className="header-menu-panel"><nav className="main-nav compact-menu-nav" aria-label="Hoofdnavigatie">{items.map(item => <span key={item.path}><MarketLink market="nl" path={item.path}>{item.label}</MarketLink></span>)}<span className="nl-menu-login"><a href={NL_PLATFORM.loginUrl}>Inloggen</a></span><MenuMarketFlag market="nl" label="Nederland"/></nav></div>
      </details>
    </div>
  </div></header>{NL_PLATFORM_DUTCH ? null : <p className="nl-platform-notice"><strong>tierisch-verliebt.nl is nog in opbouw.</strong> Aanmelden kan op dit moment alleen op onze Duitse site <strong>tierisch-verliebt.de</strong>, in het Duits. <MarketLink market="nl" path="/over-ons#platform">Meer informatie</MarketLink></p>}</>;
}

export function NlFooter() {
  const pathname = usePathname() || "/";
  const register = nlRegistrationUrl(pathname.includes("magazin") ? "magazin" : "location");
  return <footer className="tv-footer"><div className="tv-footer-inner">
    <section className="tv-footer-cta" aria-label="Dierenliefhebbers ontmoeten"><div className="tv-footer-cta-copy"><p className="tv-footer-kicker">Dating voor dierenliefhebbers</p><h2>Ontmoet singles voor wie hond, kat &amp; co. bij de familie horen.</h2><p>Gratis aanmelden, voorlopig op ons Duitstalige platform tierisch-verliebt.de.</p></div><a className="tv-footer-cta-button" href={register}>Singles ontmoeten <span aria-hidden="true">→</span></a></section>
    <div className="tv-footer-main"><div className="tv-footer-brand"><Brand light/><p className="tv-footer-claim">Met liefde voor dierenliefhebbers</p><p className="tv-footer-intro">tierisch-verliebt.nl brengt dierenliefde en dating samen. Voor mensen bij wie dieren bij de familie horen.</p><p className="nl-pilot-note">tierisch-verliebt.nl is nog in opbouw. Aanmelden en inloggen kan op dit moment alleen op de Duitse site tierisch-verliebt.de, in het Duits.</p></div>
      <nav className="tv-footer-nav" aria-label="Navigatie onderaan"><div className="tv-footer-column"><h2>Dating</h2><ul><li><MarketLink market="nl" path="/partnersuche">Alle 15 steden</MarketLink></li><li><MarketLink market="nl" path="/magazin">Magazine</MarketLink></li><li><MarketLink market="nl" path="/over-ons">Over ons</MarketLink></li><li><a href={register}>Gratis aanmelden</a></li><li><a href={NL_PLATFORM.loginUrl}>Inloggen</a></li></ul></div>
        {(["dog", "cat"] as const).map(animal => <div className="tv-footer-column" key={animal}><h2><MarketLink market="nl" path={`/magazin/${animal === "dog" ? "hondenrassen" : "kattenrassen"}`}>{animal === "dog" ? "Hondenrassen" : "Kattenrassen"}</MarketLink></h2><ul>{NL_BREEDS.filter(breed => breed.animal === animal).map(breed => <li key={breed.slug}><MarketLink market="nl" path={`/magazin/${breed.slug}`}>{breed.name}</MarketLink></li>)}</ul></div>)}
      </nav>
    </div>
    <div className="tv-footer-bottom"><span>© {new Date().getFullYear()} tierisch-verliebt.nl · Met hart voor dieren</span><div className="tv-footer-legal"><MarketLink market="nl" path="/privacy">Privacy</MarketLink><MarketLink market="nl" path="/colofon">Colofon</MarketLink><span className="tv-footer-markets nl-footer-domains" aria-label="tierisch-verliebt in andere landen">{(["de", "at", "ch"] as const).map(market => <a key={market} href={publicUrl(market)} hrefLang={getMarket(market).locale} aria-label={`${COUNTRY_NL[market]}: ${getMarket(market).domain}`} title={`${COUNTRY_NL[market]} · ${getMarket(market).domain}`}><MarketFlag market={market}/></a>)}</span></div></div>
  </div></footer>;
}
