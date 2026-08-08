import { MarketLink } from "@/components/market-link";
import Link from "next/link";
import { staticAsset } from "@/lib/static-asset";
import { getMarket, publicUrl, type MarketCode, type RegionalMarket } from "@/lib/markets";

type NavLink = { label: string; href: string; external?: boolean };
type Props = { market?: MarketCode };

const deHeader: NavLink[] = [
  { label: "Start", href: "/" }, { label: "Partnersuche", href: "/partnersuche" }, { label: "Magazin", href: "/magazin" },
  { label: "Hunde", href: "/magazin/hunderassen" }, { label: "Katzen", href: "/magazin/beliebtesten-katzenrassen" },
  { label: "Weitere Tierwelten", href: "/magazin/tierwelten" }, { label: "Apps", href: "/magazin/thema/apps" }, { label: "Über uns", href: "/magazin/ueber-uns" },
];
const deFooter: Array<{ title: string; links: NavLink[] }> = [
  { title: "Hunde", links: [{ label: "Ratgeber", href: "/magazin/thema/ratgeber-hund" },{ label: "Labrador Retriever", href: "/magazin/labrador-retriever" },{ label: "Französische Bulldogge", href: "/magazin/franzoesische-bulldogge" },{ label: "Beliebteste Hunderassen", href: "/magazin/beliebtesten-hunderassen" }] },
  { title: "Katzen", links: [{ label: "Ratgeber", href: "/magazin/thema/ratgeber-katze" },{ label: "Katzenrassen", href: "/magazin/katzenrassen" },{ label: "Britisch Kurzhaar", href: "/magazin/britisch-kurzhaar" },{ label: "Beliebteste Katzenrassen", href: "/magazin/beliebtesten-katzenrassen" }] },
  { title: "Weitere Tierwelten", links: [{ label: "Vögel", href: "/magazin/voegel-uebersicht" },{ label: "Kleintiere", href: "/magazin/kleintiere" },{ label: "Meerschweinchen", href: "/magazin/meerschweinchen" },{ label: "Kaninchen", href: "/magazin/kaninchen" }] },
  { title: "Über uns & Magazin", links: [{ label: "Unsere Geschichte", href: "/magazin/ueber-uns" },{ label: "Christian M. Haas", href: "/magazin/author/christian-m-haas" },{ label: "Redaktion", href: "/magazin/author/redaktion" },{ label: "Social Media", href: "/social-media" }] },
  { title: "Mitgliedschaft", links: [{ label: "Partnersuche", href: "/partnersuche" },{ label: "Magazin-Start", href: "/magazin" }] },
];
const logo = staticAsset("/brand/tierisch-verliebt-logo.svg");
function localLink(market: MarketCode, href: string, children: React.ReactNode, className?: string) { return market === "de" ? <Link className={className} href={href}>{children}</Link> : <MarketLink className={className} market={market as RegionalMarket} path={href}>{children}</MarketLink>; }
function Brand({ market, footer=false }: { market: MarketCode; footer?: boolean }) { const content=footer?<><span className="brand-lockup-mark">TV</span><span className="brand-lockup-copy"><strong>tierisch verliebt</strong><small>Dating für Tierfreunde mit Herz</small></span></>:<img className="brand-logo-image" src={logo} alt={`tierisch-verliebt.${market}`} width="216" height="80" />; return localLink(market,"/",content,footer?"brand-lockup footer-brand-wordmark tv-brand-lockup":"brand-lockup brand-lockup-header"); }

export function SiteHeader({ market="de" }: Props) {
  const config=getMarket(market), regional=market!=="de";
  const items=regional?[{label:"Start",href:"/"},{label:"Partnersuche",href:"/partnersuche"}]:deHeader;
  return <header className="site-header-shell"><div className="site-header-bar compact-header-bar"><Brand market={market}/><div className="header-actions compact-header-actions" aria-label="Nutzeraktionen"><a className="login-link" href={publicUrl(market,"/login/")}>Login</a><a className="header-register header-register-primary" href={publicUrl(market,"/registration/?AID=magazin")}>Registrieren</a><details className="header-menu"><summary aria-label="Menü öffnen"><span className="menu-icon" aria-hidden="true"><span/><span/><span/></span><span className="sr-only">Menü</span></summary><div className="header-menu-panel"><nav className="main-nav compact-menu-nav" aria-label="Hauptnavigation">{items.map(item=><span key={item.href}>{localLink(market,item.href,item.label)}</span>)}{regional?<span className="menu-market-label">{config.countryName}</span>:null}</nav></div></details></div></div></header>;
}

export function SiteFooter({ market="de" }: Props) {
  const config=getMarket(market), regional=market!=="de";
  const columns=regional?[
    {title:"Partnersuche",links:[{label:`Alle Städte in ${config.countryName}`,href:"/partnersuche"}]},
    {title:"Mitgliedschaft",links:[{label:"Kostenlos registrieren",href:"/registration/",external:true},{label:"Login",href:"/login/",external:true}]},
  ]:deFooter;
  return <footer className="site-footer-shell"><section className="footer-cta footer-cta-soft" aria-label="Registrierung"><div><p className="eyebrow">Tierliebe Partnersuche</p><h2>Finde tierliebe Singles, bei denen Hund, Katze & Co. wirklich dazugehören.</h2><p>Regionale Tipps und echte Profilvorschauen führen direkt zu passenden Kontakten in {config.countryName}.</p></div><a className="footer-cta-button" href={publicUrl(market,"/registration/?AID=magazin")}>Jetzt kostenlos starten</a></section><div className="footer-main"><div className="footer-brand-panel"><Brand market={market} footer/><p>tierisch-verliebt.{market} verbindet tierliebe Singles mit regionalen Einstiegen für Menschen, bei denen Tiere zur Familie gehören.</p><ul className="footer-trust-list" aria-label="Vertrauensmerkmale"><li>Gemeinsame Tierliebe statt austauschbarer Flirts</li><li>Regionale Ratgeber und tierfreundliche Treffpunkte</li><li>Direkter Einstieg in die kostenlose Registrierung</li></ul></div><nav className="footer-link-grid" aria-label="Footer Navigation">{columns.map(column=><div className="footer-column" key={column.title}><h2>{column.title}</h2><ul>{column.links.map(link=><li key={link.label}>{link.external?<a href={publicUrl(market,link.href)}>{link.label}</a>:localLink(market,link.href,link.label)}</li>)}</ul></div>)}</nav></div><div className="sub-footer"><span>© {new Date().getFullYear()} tierisch-verliebt.{market}</span><div className="sub-footer-links"><a href={publicUrl(market,"/registration/")}>Registrieren</a>{market==="de"?<Link href="/magazin">Magazin</Link>:null}<a href={publicUrl(market,"/datenschutz.html")}>Datenschutz</a><a href={publicUrl(market,"/impressum.html")}>Impressum</a><a href="https://tierisch-verliebt.de/">DE</a><a href="https://tierisch-verliebt.at/">AT</a><a href="https://tierisch-verliebt.ch/">CH</a></div></div></footer>;
}
