import type { Metadata } from "next";
import Link from "@/components/link";
import { SITE_URL, formatGermanDate, getMagazineCategories, getMagazinePages, getMagazinePosts } from "@/lib/wordpress";
import { buildMagazineIndex, countIndexLinks } from "@/lib/magazine-index";
import { serializeJsonLd } from "@/lib/json-ld";
import { MagazineIndexBrowser } from "./magazine-index-browser";
import { display } from "@/components/city-page/display-font";
import { PawIcon } from "@/components/city-page/tier-icons";
import "@/components/city-page/tier-city-page.css";
import "@/components/city-page/tier-city-hub.css";
import "../magazin-hub.css";
import "./inhalt.css";

export const revalidate = 300;

const PAGE_URL = `${SITE_URL}/magazin/inhalt/`;
const TITLE = "Inhaltsverzeichnis: alle Magazin-Beiträge & Seiten A–Z";
const DESCRIPTION =
  "Alle Ratgeber-Beiträge, Hunderassen, Katzenrassen und Kleintier-Seiten des tierisch-verliebt.de Magazins auf einen Blick – nach Thema sortiert und durchsuchbar.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, type: "website" },
};

export default async function MagazineIndexPage() {
  const [posts, pages, categories] = await Promise.all([getMagazinePosts(), getMagazinePages(), getMagazineCategories()]);
  const sections = buildMagazineIndex({ posts, pages, categories, formatDate: (date) => (date ? `Aktualisiert ${formatGermanDate(date)}` : "") });
  const total = countIndexLinks(sections);

  const breadcrumbGraph = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Magazin", item: `${SITE_URL}/magazin/` },
      { "@type": "ListItem", position: 2, name: "Inhaltsverzeichnis", item: PAGE_URL },
    ],
  };

  return (
    <main className={`tvc tvm ${display.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbGraph) }} />

      <section className="tvc-hero tvh-hero tvm-hero tvm-hero-compact">
        <div className="tvc-wrap">
          <div className="tvc-hero-copy">
            <nav className="tvc-crumbs" aria-label="Brotkrumen">
              <Link href="/">Start</Link>
              <span aria-hidden="true">›</span>
              <Link href="/magazin">Magazin</Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page">Inhaltsverzeichnis</span>
            </nav>
            <span className="tvc-badge"><PawIcon className="tvc-badge-paw" />Inhaltsverzeichnis A–Z</span>
            <h1>Alles aus dem Magazin – auf einen Blick</h1>
            <p className="tvc-lead">
              Ratgeber-Beiträge und Seiten zu Hunderassen, Katzenrassen, Kleintieren und mehr. Tippe einfach los oder spring
              direkt zum Thema.
            </p>
            <ul className="tvh-stats">
              <li><strong>{posts.length}</strong><span>Beiträge</span></li>
              <li><strong>{pages.length}</strong><span>Seiten &amp; Porträts</span></li>
              <li><strong>{sections.length}</strong><span>Themen</span></li>
            </ul>
          </div>
        </div>
      </section>

      <div className="tvc-wrap tvm-index">
        <MagazineIndexBrowser sections={sections} total={total} />
      </div>
    </main>
  );
}
