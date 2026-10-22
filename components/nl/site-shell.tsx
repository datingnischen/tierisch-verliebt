"use client";

import { usePathname } from "next/navigation";
import { MarketLink } from "@/components/market-link";
import { NL_BREEDS, NL_PLATFORM, NL_PLATFORM_DUTCH, nlRegistrationUrl } from "@/lib/nl-routes";

function Brand({ light = false }: { light?: boolean }) {
  return <MarketLink market="nl" path="/" className={`brand-lockup nl-brand${light ? " nl-brand-light" : ""}`}>
    <svg viewBox="0 0 64 64" width="48" height="48" aria-hidden="true"><path fill="#c02e2e" d="M32 56 7 32C-8 14 13-4 32 13 51-4 72 14 57 32Z"/><g fill="white"><ellipse cx="19" cy="26" rx="4" ry="5"/><ellipse cx="28" cy="21" rx="4" ry="5"/><ellipse cx="38" cy="21" rx="4" ry="5"/><ellipse cx="47" cy="26" rx="4" ry="5"/><path d="M22 40c0-7 7-12 11-12s11 5 11 12c0 7-7 3-11 3s-11 4-11-3"/></g></svg>
    <span>tierisch-verliebt<span className="nl-brand-domain">.nl</span><small>Met liefde voor dierenliefhebbers</small></span>
  </MarketLink>;
}

export function NlHeader() {
  const items = [{ label: "Home", path: "/" }, { label: "Dating", path: "/partnersuche" }, { label: "Magazine", path: "/magazin" }, { label: "Hondenrassen", path: "/magazin/hondenrassen" }, { label: "Kattenrassen", path: "/magazin/kattenrassen" }, { label: "Over ons", path: "/over-ons" }];
  return <header className="site-header-shell"><div className="site-header-bar compact-header-bar"><Brand />
    <div className="header-actions compact-header-actions" aria-label="Je account">
      <a className="login-link" href={NL_PLATFORM.loginUrl}>Inloggen</a>
      <a className="header-register header-register-primary" href={nlRegistrationUrl("location")}>Aanmelden</a>
      <details className="header-menu"><summary aria-label="Menu openen"><span className="menu-icon" aria-hidden="true"><span/><span/><span/></span><span className="sr-only">Menu</span></summary>
        <div className="header-menu-panel"><nav className="main-nav compact-menu-nav" aria-label="Hoofdnavigatie">{items.map(item => <span key={item.path}><MarketLink market="nl" path={item.path}>{item.label}</MarketLink></span>)}<span className="nl-menu-login"><a href={NL_PLATFORM.loginUrl}>Inloggen</a></span><span className="menu-market-label">Nederland</span></nav></div>
      </details>
    </div>
  </div>{NL_PLATFORM_DUTCH ? null : <p className="nl-platform-notice">Aanmelden en inloggen gaan voorlopig via ons Duitstalige platform <strong>tierisch-verliebt.de</strong>. Een Nederlandse versie volgt. <MarketLink market="nl" path="/over-ons#platform">Meer informatie</MarketLink></p>}</header>;
}

export function NlFooter() {
  const pathname = usePathname() || "/";
  const register = nlRegistrationUrl(pathname.includes("magazin") ? "magazin" : "location");
  return <footer className="tv-footer"><div className="tv-footer-inner">
    <section className="tv-footer-cta" aria-label="Dierenliefhebbers ontmoeten"><div className="tv-footer-cta-copy"><p className="tv-footer-kicker">Dating voor dierenliefhebbers</p><h2>Ontmoet singles voor wie hond, kat &amp; co. bij de familie horen.</h2><p>Gratis aanmelden, voorlopig op ons Duitstalige platform tierisch-verliebt.de.</p></div><a className="tv-footer-cta-button" href={register}>Singles ontmoeten <span aria-hidden="true">→</span></a></section>
    <div className="tv-footer-main"><div className="tv-footer-brand"><Brand light/><p className="tv-footer-claim">Met liefde voor dierenliefhebbers</p><p className="tv-footer-intro">tierisch-verliebt.nl brengt dierenliefde en dating samen. Voor mensen bij wie dieren bij de familie horen.</p><p className="nl-pilot-note">Een Nederlands ledenplatform volgt. Tot die tijd gaan aanmelden en inloggen via tierisch-verliebt.de.</p></div>
      <nav className="tv-footer-nav" aria-label="Navigatie onderaan"><div className="tv-footer-column"><h2>Dating</h2><ul><li><MarketLink market="nl" path="/partnersuche">Alle 15 steden</MarketLink></li><li><MarketLink market="nl" path="/magazin">Magazine</MarketLink></li><li><MarketLink market="nl" path="/over-ons">Over ons</MarketLink></li><li><a href={register}>Gratis aanmelden</a></li><li><a href={NL_PLATFORM.loginUrl}>Inloggen</a></li></ul></div>
        {(["dog", "cat"] as const).map(animal => <div className="tv-footer-column" key={animal}><h2><MarketLink market="nl" path={`/magazin/${animal === "dog" ? "hondenrassen" : "kattenrassen"}`}>{animal === "dog" ? "Hondenrassen" : "Kattenrassen"}</MarketLink></h2><ul>{NL_BREEDS.filter(breed => breed.animal === animal).map(breed => <li key={breed.slug}><MarketLink market="nl" path={`/magazin/${breed.slug}`}>{breed.name}</MarketLink></li>)}</ul></div>)}
      </nav>
    </div>
    <div className="tv-footer-bottom"><span>© {new Date().getFullYear()} tierisch-verliebt.nl · Met hart voor dieren</span><div className="tv-footer-legal"><MarketLink market="nl" path="/privacy">Privacy</MarketLink><MarketLink market="nl" path="/colofon">Colofon</MarketLink><span className="tv-footer-markets" aria-label="Land kiezen"><MarketLink market="de" path="/">DE</MarketLink><MarketLink market="at" path="/">AT</MarketLink><MarketLink market="ch" path="/">CH</MarketLink><MarketLink market="nl" path="/">NL</MarketLink></span></div></div>
  </div></footer>;
}
