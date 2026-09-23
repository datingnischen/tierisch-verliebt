import { Fragment } from "react";
import Link from "next/link";
import { getHubLetter, getHubTileFacts, getHubTileTeaser, type HubLink } from "@/lib/magazine-hub";
import { findTierwelt } from "@/lib/tierwelten";
import { getEntryCoverImage, type MagazineEntry } from "@/lib/wordpress";
import "./magazine-hub-grid.css";

type HubPromo = {
  href: string;
  image: string;
  imageAlt: string;
  audience: string;
};

type Props = {
  links: HubLink[];
  entries: Map<string, MagazineEntry>;
  title: string;
  emoji: string;
  promo: HubPromo;
};

const PROMO_AFTER = 6;

export function MagazineHubGrid({ links, entries, title, emoji, promo }: Props) {
  const tiles = links.map((link) => {
    const entry = entries.get(link.slug);
    const facts = entry ? getHubTileFacts(entry.content) : {};
    return {
      ...link,
      letter: getHubLetter(link.label),
      image: entry ? getEntryCoverImage(entry) : undefined,
      teaser: entry ? getHubTileTeaser(entry.excerpt || entry.content) : "",
      badge: findTierwelt(link.slug)?.world.tagline || facts.origin,
      traits: [facts.weight, facts.lifespan].filter((value): value is string => Boolean(value)),
    };
  });
  const letters = [...new Set(tiles.map((tile) => tile.letter))];

  return (
    <section className="hub-grid-section" aria-labelledby="hub-grid-titel">
      <header className="hub-grid-header">
        <span className="hub-grid-badge" aria-hidden="true">
          {emoji}
        </span>
        <div>
          <span className="eyebrow eyebrow-brand">Alle Porträts</span>
          <h2 id="hub-grid-titel">
            {tiles.length} {title} im Überblick
          </h2>
        </div>
      </header>

      {letters.length > 4 ? (
        <nav className="hub-grid-letters" aria-label="Nach Anfangsbuchstabe springen">
          {letters.map((letter) => (
            <a key={letter} href={`#hub-${letter.toLowerCase()}`}>
              {letter}
            </a>
          ))}
        </nav>
      ) : null}

      <div className="hub-grid">
        {tiles.map((tile, index) => {
          const href = `/magazin/${tile.slug}`;
          const firstOfLetter = index === 0 || tiles[index - 1].letter !== tile.letter;
          return (
            <Fragment key={tile.slug}>
            <article className="hub-tile" id={firstOfLetter ? `hub-${tile.letter.toLowerCase()}` : undefined}>
              <Link href={href} className="hub-tile-media" tabIndex={-1} aria-hidden="true">
                {tile.image ? (
                  <img src={tile.image} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="hub-tile-fallback">{emoji}</span>
                )}
                {tile.badge ? <span className="hub-tile-badge">{tile.badge}</span> : null}
              </Link>
              <div className="hub-tile-body">
                <h3>
                  <Link href={href}>{tile.label}</Link>
                </h3>
                {tile.teaser ? <p>{tile.teaser}</p> : null}
                {tile.traits.length ? (
                  <ul className="hub-tile-traits" aria-label={`Eckdaten ${tile.label}`}>
                    {tile.traits.map((trait) => (
                      <li key={trait}>{trait}</li>
                    ))}
                  </ul>
                ) : null}
                <Link className="hub-tile-cta" href={href}>
                  Porträt lesen <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
            {index === PROMO_AFTER - 1 ? (
              <a className="hub-tile hub-tile-promo" href={promo.href}>
                <span className="hub-tile-media">
                  <img src={promo.image} alt={promo.imageAlt} loading="lazy" decoding="async" />
                </span>
                <span className="hub-tile-body">
                  <span className="eyebrow">Singlebörse</span>
                  <strong>Lieber mit jemandem teilen?</strong>
                  <span>Hier triffst du {promo.audience}.</span>
                  <span className="button button-primary">Kostenlos registrieren</span>
                </span>
              </a>
            ) : null}
            </Fragment>
          );
        })}
      </div>

      <aside className="hub-cta">
        <img src={promo.image} alt="" loading="lazy" decoding="async" />
        <div>
          <span className="eyebrow">Singlebörse</span>
          <h2>Deine Lieblingsrasse gefunden? Jetzt fehlt nur noch der passende Mensch.</h2>
          <p>Bei tierisch-verliebt.de triffst du {promo.audience} – kostenlos und ohne Umwege.</p>
        </div>
        <a className="button button-primary" href={promo.href}>
          Jetzt kostenlos registrieren
        </a>
      </aside>
    </section>
  );
}
