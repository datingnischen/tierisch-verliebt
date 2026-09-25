"use client";

import { usePathname } from "next/navigation";
import { MarketLink } from "@/components/market-link";
import { getMarket, publicUrl, type MarketCode } from "@/lib/markets";
import { staticAsset } from "@/lib/static-asset";

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
      { label: "Bewertungen", href: "/ueber-uns/bewertungen" },
      { label: "Presse & Sponsoring", href: "/magazin/thema/presse" },
      { label: "Christian M. Haas", href: "/magazin/christian" },
      { label: "Social Media", href: "/ueber-uns/social-media" },
    ],
  },
  { title: "Mitgliedschaft", links: [{ label: "Partnersuche", href: "/partnersuche" }, { label: "Magazin-Start", href: "/magazin" }, { label: "Inhaltsverzeichnis A–Z", href: "/magazin/inhalt" }] },
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

function marketSwitchHref(currentMarket: MarketCode, targetMarket: MarketCode) {
  return currentMarket === targetMarket ? "/" : `/${targetMarket}`;
}

function Brand({ market }: { market: MarketCode }) {
  const logo = logoByMarket[market];
  return localLink(
    market,
    "/",
    <img className="brand-logo-image" src={logo.src} alt={logo.alt} width="216" height="80" />,
    "brand-lockup brand-lockup-header",
  );
}

function PawIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <ellipse cx="14" cy="26" rx="6" ry="8" />
      <ellipse cx="25" cy="14" rx="6" ry="8.5" />
      <ellipse cx="39" cy="14" rx="6" ry="8.5" />
      <ellipse cx="50" cy="26" rx="6" ry="8" />
      <path d="M32 30c-8 0-17 11-17 19 0 6 5 8 9 7 3-1 5-2 8-2s5 1 8 2c4 1 9-1 9-7 0-8-9-19-17-19z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M5 10.5l3.2 3.2L15 7" />
    </svg>
  );
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
    <footer className="tv-footer">
      <div className="tv-footer-inner">
        <section className="tv-footer-cta" aria-label="Registrierung">
          <PawIcon className="tv-footer-cta-paw tv-footer-cta-paw-big" />
          <PawIcon className="tv-footer-cta-paw tv-footer-cta-paw-small" />
          <div className="tv-footer-cta-copy">
            <p className="tv-footer-kicker">Tierliebe Partnersuche</p>
            <h2>Finde tierliebe Singles, bei denen Hund, Katze & Co. wirklich dazugehören.</h2>
            <p>Regionale Tipps und echte Profilvorschauen führen direkt zu passenden Kontakten in {config.countryName}.</p>
          </div>
          <a className="tv-footer-cta-button" href={register}>
            Jetzt kostenlos starten
            <span aria-hidden="true">→</span>
          </a>
        </section>

        <div className="tv-footer-main">
          <div className="tv-footer-brand">
            {localLink(
              market,
              "/",
              <img
                src={staticAsset(`/brand/tierisch-verliebt-logo-light-${market}.svg`)}
                alt={logoByMarket[market].alt}
                width="216"
                height="80"
              />,
              "tv-footer-logo",
            )}
            <p className="tv-footer-claim">
              <PawIcon />
              Mit Liebe für Tierfreunde
            </p>
            <p className="tv-footer-intro">
              tierisch-verliebt.{market} verbindet tierliebe Singles mit regionalen Einstiegen für Menschen, bei denen Tiere zur
              Familie gehören.
            </p>
            <ul className="tv-footer-trust" aria-label="Vertrauensmerkmale">
              <li><CheckIcon />Gemeinsame Tierliebe statt austauschbarer Flirts</li>
              <li><CheckIcon />Regionale Ratgeber und tierfreundliche Treffpunkte</li>
              <li><CheckIcon />Direkter Einstieg in die kostenlose Registrierung</li>
            </ul>
          </div>
          <nav className={`tv-footer-nav${regional ? " tv-footer-nav-compact" : ""}`} aria-label="Footer Navigation">
            {columns.map((column) => (
              <div className="tv-footer-column" key={column.title}>
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

        <div className="tv-footer-bottom">
          <span>© {new Date().getFullYear()} tierisch-verliebt.{market} · Dating für Tierfreunde mit Herz</span>
          <div className="tv-footer-legal">
            <a href={register}>Registrieren</a>
            {market === "de" ? localLink(market, "/magazin", "Magazin") : null}
            <a href={publicUrl(market, "/datenschutz.html")}>Datenschutz</a>
            <a href={publicUrl(market, "/impressum.html")}>Impressum</a>
            <span className="tv-footer-markets" aria-label="Land wählen">
              <a href={marketSwitchHref(market, "de")} aria-current={market === "de" ? "true" : undefined}>DE</a>
              <a href={marketSwitchHref(market, "at")} aria-current={market === "at" ? "true" : undefined}>AT</a>
              <a href={marketSwitchHref(market, "ch")} aria-current={market === "ch" ? "true" : undefined}>CH</a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
