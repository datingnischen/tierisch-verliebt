"use client";

import { MarketLink } from "@/components/market-link";
import { MenuMarketFlag } from "@/components/market-flag";
import { IT_CITIES, IT_PLATFORM } from "@/lib/it-routes";
import { CH_LOGO } from "./copy";

const CITIES = IT_CITIES.map((city) => ({ name: city.name, path: `/${city.slug}` }));

function Brand() {
  return <MarketLink market="it" path="/" className="brand-lockup brand-lockup-header">
    <img className="brand-logo-image" src={CH_LOGO} alt="tierisch-verliebt.ch Logo" width="216" height="80" />
  </MarketLink>;
}

export function ItHeader() {
  return <header className="site-header-shell"><div className="site-header-bar compact-header-bar"><Brand />
    <div className="header-actions compact-header-actions" aria-label="Il tuo account">
      <a className="login-link" href={IT_PLATFORM.loginUrl}>Accedi</a>
      <a className="header-register header-register-primary" href={IT_PLATFORM.registrationUrl}>Iscriviti</a>
      <details className="header-menu"><summary aria-label="Apri il menu"><span className="menu-icon" aria-hidden="true"><span/><span/><span/></span><span className="sr-only">Menu</span></summary>
        <div className="header-menu-panel"><nav className="main-nav compact-menu-nav" aria-label="Navigazione principale">
          <span><MarketLink market="it" path="/">Home</MarketLink></span>
          {CITIES.map((city) => <span key={city.path}><MarketLink market="it" path={city.path}>{city.name}</MarketLink></span>)}
          <span className="nl-menu-login"><a href={IT_PLATFORM.loginUrl}>Accedi</a></span>
          <MenuMarketFlag market="it" label="Svizzera italiana"/>
        </nav></div>
      </details>
    </div>
  </div></header>;
}

export function ItFooter() {
  return <footer className="tv-footer"><div className="tv-footer-inner">
    <section className="tv-footer-cta" aria-label="Incontra chi ama gli animali"><div className="tv-footer-cta-copy"><p className="tv-footer-kicker">Incontri per amanti degli animali</p><h2>Conosci single per cui cane, gatto &amp; co. fanno parte della famiglia.</h2><p>Iscrizione gratuita sulla piattaforma svizzera tierisch-verliebt.ch.</p></div><a className="tv-footer-cta-button" href={IT_PLATFORM.registrationUrl}>Iscriviti gratis <span aria-hidden="true">→</span></a></section>
    <div className="tv-footer-main"><div className="tv-footer-brand"><p className="tv-footer-claim">Con amore per gli amanti degli animali</p><p className="tv-footer-intro">tierisch-verliebt.ch unisce amore per gli animali e incontri. Per chi considera gli animali parte della famiglia.</p></div>
      <nav className="tv-footer-nav" aria-label="Navigazione in fondo alla pagina"><div className="tv-footer-column"><h2>Città in Ticino</h2><ul>{CITIES.map((city) => <li key={city.path}><MarketLink market="it" path={city.path}>{city.name}</MarketLink></li>)}</ul></div>
        <div className="tv-footer-column"><h2>Account</h2><ul><li><a href={IT_PLATFORM.registrationUrl}>Registrazione gratuita</a></li><li><a href={IT_PLATFORM.loginUrl}>Accedi</a></li></ul></div>
      </nav>
    </div>
    <div className="tv-footer-bottom"><span>© {new Date().getFullYear()} tierisch-verliebt.ch · Con il cuore per gli animali</span><div className="tv-footer-legal"><a href="https://tierisch-verliebt.ch/datenschutz.html">Protezione dei dati</a><a href="https://tierisch-verliebt.ch/impressum.html">Impressum</a><span className="tv-footer-markets" aria-label="Scegli la lingua"><MarketLink market="ch" path="/">Deutsch</MarketLink><MarketLink market="it" path="/">Italiano</MarketLink></span></div></div>
  </div></footer>;
}
