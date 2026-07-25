type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

const headerMenuItems: NavLink[] = [
  { label: "Start", href: "/" },
  { label: "Magazin", href: "/magazin" },
  { label: "Registrieren", href: "https://tierisch-verliebt.de/?AID=magazin", external: true },
  { label: "Hunde", href: "/magazin/hunderassen" },
  { label: "Katzen", href: "/magazin/beliebtesten-katzenrassen" },
  { label: "Weitere Tierwelten", href: "/magazin/tierwelten" },
  { label: "Apps", href: "/magazin/thema/apps" },
  { label: "Über uns", href: "/magazin/ueber-uns" },
];

const footerColumns: Array<{ title: string; links: NavLink[] }> = [
  {
    title: "Hunde",
    links: [
      { label: "Ratgeber", href: "/magazin/thema/ratgeber-hund" },
      { label: "Labrador Retriever", href: "/magazin/labrador-retriever" },
      { label: "Französische Bulldogge", href: "/magazin/franzoesische-bulldogge" },
      { label: "Chihuahua", href: "/magazin/chihuahua" },
      { label: "Beliebtesten Hunderassen", href: "/magazin/beliebtesten-hunderassen" },
      { label: "Bulldoggen Rassen", href: "/magazin/bulldoggen-rassen" },
      { label: "Listenhunde", href: "/magazin/listenhunde" },
      { label: "FCI-Gruppen", href: "/magazin/fci-gruppen" },
    ],
  },
  {
    title: "Katzen",
    links: [
      { label: "Ratgeber", href: "/magazin/thema/ratgeber-katze" },
      { label: "Katzenrassen", href: "/magazin/katzenrassen" },
      { label: "Britisch Kurzhaar", href: "/magazin/britisch-kurzhaar" },
      { label: "Die Bengal – Katze", href: "/magazin/bengal-katze" },
      { label: "German Rex", href: "/magazin/german-rex" },
      { label: "Beliebtesten Katzenrassen", href: "/magazin/beliebtesten-katzenrassen" },
    ],
  },
  {
    title: "Weitere Tierwelten",
    links: [
      { label: "Vögel", href: "/magazin/voegel-uebersicht" },
      { label: "Kleintiere", href: "/magazin/kleintiere" },
      { label: "Meerschweinchen", href: "/magazin/meerschweinchen" },
      { label: "Der Wellensittich", href: "/magazin/wellensittich" },
      { label: "Kaninchen", href: "/magazin/kaninchen" },
      { label: "Mäuse", href: "/magazin/maus" },
      { label: "Hamster", href: "/magazin/hamster" },
    ],
  },
  {
    title: "Über uns & Magazin",
    links: [
      { label: "Unsere Geschichte", href: "/magazin/ueber-uns" },
      { label: "Unser Datingexperte", href: "/magazin/christian" },
      { label: "Christian M. Haas", href: "/magazin/author/christian-m-haas" },
      { label: "Redaktion", href: "/magazin/author/redaktion" },
      { label: "Social Media", href: "https://tierisch-verliebt.de/social-media/", external: true },
      { label: "Presse & Sponsoring", href: "/magazin/thema/presse" },
      { label: "Apps", href: "/magazin/thema/apps" },
    ],
  },
  {
    title: "Mitgliedschaft",
    links: [
      { label: "Registrieren", href: "https://tierisch-verliebt.de/?AID=magazin", external: true },
      { label: "Startseite", href: "https://tierisch-verliebt.de/", external: true },
      { label: "Magazin-Start", href: "/magazin" },
      { label: "Kostenlos starten", href: "https://tierisch-verliebt.de/?AID=magazin", external: true },
    ],
  },
];

function externalAttrs(external?: boolean) {
  return external ? { target: "_blank", rel: "noopener" } : undefined;
}

export function SiteHeader() {
  return (
    <header className="site-header-shell">
      <div className="site-header-bar compact-header-bar shell">
        <a className="brand-lockup tv-brand-lockup" href="/" aria-label="tierisch-verliebt.de Startseite">
          <span className="brand-lockup-mark">TV</span>
          <span className="brand-lockup-copy">
            <strong>tierisch verliebt</strong>
            <small>Singles für Tierfreunde & Haustiermenschen</small>
          </span>
        </a>

        <div className="header-actions compact-header-actions" aria-label="Nutzeraktionen">
          <a className="header-register header-register-primary" href="https://tierisch-verliebt.de/?AID=magazin">Registrieren</a>

          <details className="header-menu">
            <summary aria-label="Menü öffnen">
              <span className="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
              <span>Menü</span>
            </summary>
            <div className="header-menu-panel">
              <nav className="main-nav compact-menu-nav" aria-label="Hauptnavigation">
                {headerMenuItems.map((item) => (
                  <a href={item.href} key={item.href} {...externalAttrs(item.external)}>{item.label}</a>
                ))}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer-shell">
      <section className="footer-cta footer-cta-soft" aria-label="Registrierung">
        <div>
          <p className="eyebrow">Tierliebe Partnersuche</p>
          <h2>Finde tierliebe Singles, bei denen Hund, Katze & Co. wirklich dazugehören.</h2>
          <p>Magazin, Ratgeber und echte Geschichten helfen beim Einstieg — und führen direkt zu passenden Kontakten.</p>
        </div>
        <a className="footer-cta-button" href="https://tierisch-verliebt.de/?AID=magazin">Jetzt kostenlos starten</a>
      </section>

      <div className="footer-main">
        <div className="footer-brand-panel">
          <a className="brand-lockup footer-brand-wordmark tv-brand-lockup" href="/" aria-label="tierisch-verliebt.de Startseite">
            <span className="brand-lockup-mark">TV</span>
            <span className="brand-lockup-copy">
              <strong>tierisch verliebt</strong>
              <small>Dating für Tierfreunde mit Herz</small>
            </span>
          </a>
          <p>
            tierisch-verliebt.de verbindet tierliebe Singles, Haustier-Community und Tier-Magazin in einer klaren,
            warmen Oberfläche für Menschen, bei denen Tiere zur Familie gehören.
          </p>
          <ul className="footer-trust-list" aria-label="Vertrauensmerkmale">
            <li>Gemeinsame Tierliebe statt austauschbarer Flirts</li>
            <li>Ratgeber für Hund, Katze und weitere Tierwelten</li>
            <li>Direkter Einstieg in die kostenlose Registrierung</li>
          </ul>
        </div>

        <nav className="footer-link-grid" aria-label="Footer Navigation">
          {footerColumns.map((column) => (
            <div className="footer-column" key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <a href={link.href} {...externalAttrs(link.external)}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="sub-footer">
        <div>
          <span>© {new Date().getFullYear()} tierisch-verliebt.de</span>
        </div>
        <div className="sub-footer-links">
          <a href="https://tierisch-verliebt.de/?AID=magazin">Registrieren</a>
          <a href="https://tierisch-verliebt.de/magazin/">Magazin</a>
          <a href="https://tierisch-verliebt.de/datenschutz.html">Datenschutz</a>
          <a href="https://tierisch-verliebt.de/impressum.html">Impressum</a>
        </div>
      </div>
    </footer>
  );
}
