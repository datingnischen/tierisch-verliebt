import type { ReactNode } from "react";
import Link from "@/components/link";
import { PawIcon } from "@/components/city-page/tier-icons";
import { display } from "@/components/city-page/display-font";
import {
  ABOUT_OVERVIEW_PATH,
  ABOUT_PRESS_PATH,
  ABOUT_REVIEWS_PATH,
  ABOUT_SEARCH_PATH,
  ABOUT_SOCIAL_MEDIA_PATH,
  ABOUT_STORY_PATH,
} from "@/lib/about-section";
import { FAQ_PATH } from "@/lib/faq";
import "@/components/city-page/tier-city-page.css";
import "@/components/city-page/tier-city-hub.css";
import "./about.css";

const SUBNAV = [
  { href: ABOUT_OVERVIEW_PATH, label: "Über uns" },
  { href: ABOUT_STORY_PATH, label: "Geschichte" },
  { href: ABOUT_REVIEWS_PATH, label: "Bewertungen" },
  { href: ABOUT_SOCIAL_MEDIA_PATH, label: "Social Media" },
  { href: ABOUT_PRESS_PATH, label: "Presse & Sponsoring" },
  { href: "/magazin/christian", label: "Christian M. Haas" },
  { href: FAQ_PATH, label: "Häufige Fragen" },
  { href: ABOUT_SEARCH_PATH, label: "Suche" },
];

/**
 * Rahmen für alle Über-uns-Seiten im Gassi-Guide-Look der Städteübersicht:
 * weinroter Hero mit Pfotenmuster, Unternavigation, Inhalt auf cremefarbenem Grund.
 */
export function AboutShell({
  current,
  crumb,
  badge,
  title,
  lead,
  actions,
  stats,
  aside,
  children,
}: {
  current: string;
  crumb: string;
  badge: string;
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
  stats?: { value: string; label: string }[];
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className={`tvc tvh tva ${display.variable}`}>
      <section className="tvc-hero tvh-hero tva-hero">
        <div className={`tvc-wrap tva-hero-grid${aside ? "" : " tva-hero-solo"}`}>
          <div className="tvc-hero-copy">
            <nav className="tvc-crumbs" aria-label="Brotkrumen">
              <Link href="/">Start</Link>
              <span aria-hidden="true">›</span>
              {current === ABOUT_OVERVIEW_PATH ? (
                <span aria-current="page">Über uns</span>
              ) : (
                <>
                  <Link href={ABOUT_OVERVIEW_PATH}>Über uns</Link>
                  <span aria-hidden="true">›</span>
                  <span aria-current="page">{crumb}</span>
                </>
              )}
            </nav>
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />{badge}</span>
            <h1>{title}</h1>
            {lead ? <div className="tvc-lead">{lead}</div> : null}
            {stats?.length ? (
              <ul className="tvh-stats">
                {stats.map((stat) => <li key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></li>)}
              </ul>
            ) : null}
            {actions ? <div className="tvc-actions">{actions}</div> : null}
          </div>
          {aside}
        </div>
      </section>

      <nav className="tvc-wrap tva-subnav" aria-label="Über uns">
        {SUBNAV.map((item) => (
          <Link key={item.href} href={item.href} aria-current={item.href === current ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </main>
  );
}

/** Polaroid-Bild für die rechte Hero-Spalte. */
export function AboutPolaroid({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="tvh-polaroid tva-polaroid">
      <img src={src} alt={alt} loading="eager" decoding="async" />
      <figcaption><PawIcon />{caption}</figcaption>
    </figure>
  );
}
