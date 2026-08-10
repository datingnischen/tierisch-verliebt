"use client";

import { usePathname } from "next/navigation";
import { MarketLink } from "@/components/market-link";
import { getMarket, publicUrl, type MarketCode } from "@/lib/markets";

type NavLink = { label: string; href: string; external?: boolean };
type Props = { market?: MarketCode };

const deHeader: NavLink[] = [
  { label: "Start", href: "/" },
  { label: "Partnersuche", href: "/partnersuche" },
  { label: "Magazin", href: "/magazin" },
  { label: "Hunde", href: "/magazin/hunderassen" },
  { label: "Katzen", href: "/magazin/beliebtesten-katzenrassen" },
  { label: "Weitere Tierwelten", href: "/magazin/tierwelten" },
  { label: "Apps", href: "/magazin/thema/apps" },
  { label: "Über uns", href: "/ueber-uns" },
];

const deFooter: Array<{ title: string; links: NavLink[] }> = [
  {
    title: "Hunde",
    links: [
      { label: "Ratgeber", href: "/magazin/thema/ratgeber-hund" },
      { label: "Labrador Retriever", href: "/magazin/labrador-retriever" },
      { label: "Französische Bulldogge", href: "/magazin/franzoesische-bulldogge" },
      { label: "Beliebteste Hunderassen", href: "/magazin/beliebtesten-hunderassen" },
    ],
  },
  {
    title: "Katzen",
    links: [
      { label: "Ratgeber", href: "/magazin/thema/ratgeber-katze" },
      { label: "Katzenrassen", href: "/magazin/katzenrassen" },
      { label: "Britisch Kurzhaar", href: "/magazin/britisch-kurzhaar" },
      { label: "Beliebteste Katzenrassen", href: "/magazin/beliebtesten-katzenrassen" },
    ],
  },
  {
    title: "Weitere Tierwelten",
    links: [
      { label: "Vögel", href: "/magazin/voegel-uebersicht" },
      { label: "Kleintiere", href: "/magazin/kleintiere" },
      { label: "Meerschweinchen", href: "/magazin/meerschweinchen" },
      { label: "Kaninchen", href: "/magazin/kaninchen" },
    ],
  },
  {
    title: "Über uns & Magazin",
    links: [
      { label: "Unsere Geschichte", href: "/ueber-uns/geschichte" },
      { label: "Presse & Sponsoring", href: "/magazin/thema/presse" },
      { label: "Christian M. Haas", href: "/magazin/author/christian-m-haas" },
      { label: "Redaktion", href: "/magazin/author/redaktion" },
      { label: "Social Media", href: "/ueber-uns/social-media" },
    ],
  },
  { title: "Mitgliedschaft", links: [{ label: "Partnersuche", href: "/partnersuche" }, { label: "Magazin-Start", href: "/magazin" }] },
];

const logoByMarket: Record<MarketCode, { src: string; alt: string }> = {
  de: {
    src: "https://static2.icony-hosting.de/dyncontenta4a2c6ef760359a40c5972ce5e4dd552/img/tierischverliebt/logo.svg",
    alt: "tierisch-verliebt.de Logo",
  },
  at: {
    src: "https://static2.icony-hosting.de/dyncontentcb72a5051616a0d0a687530951e79ac2/img/tierischverliebtat/logo.svg",
    alt: "tierisch-verliebt.at Logo",
  },
  ch: {
    src: "https://static2.icony-hosting.de/dyncontent36672bdefe632c6e08d5c1e307546c4d/img/tierischverliebtch/logo.svg",
    alt: "tierisch-verliebt.ch Logo",
  },
};

function localLink(market: MarketCode, href: string, children: React.ReactNode, className?: string) {
  return (
    <MarketLink className={className} market={market} path={href}>
      {children}
    </MarketLink>
  );
}

function isCityPage(pathname: string) {
  return /^\/(?:(?:de|at|ch)\/)?partnersuche\/[a-z0-9-]+\/?$/i.test(pathname);
}

function registrationHref(market: MarketCode, pathname: string) {
  return publicUrl(market, isCityPage(pathname) ? "/registration/?AID=location" : "/?AID=magazin");
}

function Brand({ market, footer = false }: { market: MarketCode; footer?: boolean }) {
  const logo = logoByMarket[market];
  const content = footer ? (
    <>
      <span className="brand-lockup-mark">TV</span>
      <span className="brand-lockup-copy">
        <strong>tierisch verliebt</strong>
        <small>Dating für Tierfreunde mit Herz</small>
      </span>
    </>
  ) : (
    <img className="brand-logo-image" src={logo.src} alt={logo.alt} width="216" height="80" />
  );
  return localLink(market, "/", content, footer ? "brand-lockup footer-brand-wordmark tv-brand-lockup" : "brand-lockup brand-lockup-header");
}

export function SiteHeader({ market = "de" }: Props) {
  const pathname = usePathname() || "/";
  const config = getMarket(market);
  const regional = market !== "de";
  const items = regional ? [{ label: "Start", href: "/" }, { label: "Partnersuche", href: "/partnersuche" }] : deHeader;
  const register = registrationHref(market, pathname);

  return (
    <header className="site-header-shell">
      <div className="site-header-bar compact-header-bar">
        <Brand market={market} />
        <div className="header-actions compact-header-actions" aria-label="Nutzeraktionen">
          <a className="login-link" href={publicUrl(market, "/login/")}>Login</a>
          <a className="header-register header-register-primary" href={register}>Registrieren</a>
          <details className="header-menu">
            <summary aria-label="Menü öffnen">
              <span className="menu-icon" aria-hidden="true"><span /><span /><span /></span>
              <span className="sr-only">Menü</span>
            </summary>
            <div className="header-menu-panel">
              <nav className="main-nav compact-menu-nav" aria-label="Hauptnavigation">
                {items.map((item) => <span key={item.href}>{localLink(market, item.href, item.label)}</span>)}
                {regional ? <span className="menu-market-label">{config.countryName}</span> : null}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ market = "de" }: Props) {
  const pathname = usePathname() || "/";
  const config = getMarket(market);
  const regional = market !== "de";
  const register = registrationHref(market, pathname);
  const columns = regional
    ? [
        { title: "Partnersuche", links: [{ label: `Alle Städte in ${config.countryName}`, href: "/partnersuche" }] },
        { title: "Mitgliedschaft", links: [{ label: "Kostenlos registrieren", href: register, external: true }, { label: "Login", href: publicUrl(market, "/login/"), external: true }] },
      ]
    : deFooter;

  return (
    <footer className="site-footer-shell">
      <section className="footer-cta footer-cta-soft" aria-label="Registrierung">
        <div>
          <p className="eyebrow">Tierliebe Partnersuche</p>
          <h2>Finde tierliebe Singles, bei denen Hund, Katze & Co. wirklich dazugehören.</h2>
          <p>Regionale Tipps und echte Profilvorschauen führen direkt zu passenden Kontakten in {config.countryName}.</p>
        </div>
        <a className="footer-cta-button" href={register}>Jetzt kostenlos starten</a>
      </section>
      <div className="footer-main">
        <div className="footer-brand-panel">
          <Brand market={market} footer />
          <p>tierisch-verliebt.{market} verbindet tierliebe Singles mit regionalen Einstiegen für Menschen, bei denen Tiere zur Familie gehören.</p>
          <ul className="footer-trust-list" aria-label="Vertrauensmerkmale">
            <li>Gemeinsame Tierliebe statt austauschbarer Flirts</li>
            <li>Regionale Ratgeber und tierfreundliche Treffpunkte</li>
            <li>Direkter Einstieg in die kostenlose Registrierung</li>
          </ul>
        </div>
        <nav className="footer-link-grid" aria-label="Footer Navigation">
          {columns.map((column) => (
            <div className="footer-column" key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? <a href={link.href}>{link.label}</a> : localLink(market, link.href, link.label)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="sub-footer">
        <span>© {new Date().getFullYear()} tierisch-verliebt.{market}</span>
        <div className="sub-footer-links">
          <a href={register}>Registrieren</a>
          {market === "de" ? localLink(market, "/magazin", "Magazin") : null}
          <a href={publicUrl(market, "/datenschutz.html")}>Datenschutz</a>
          <a href={publicUrl(market, "/impressum.html")}>Impressum</a>
          <a href="https://tierisch-verliebt.de/">DE</a>
          <a href="https://tierisch-verliebt.at/">AT</a>
          <a href="https://tierisch-verliebt.ch/">CH</a>
        </div>
      </div>
    </footer>
  );
}
