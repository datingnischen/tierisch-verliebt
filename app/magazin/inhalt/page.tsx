import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, formatGermanDate, getMagazineCategories, getMagazinePages, getMagazinePosts } from "@/lib/wordpress";
import { buildMagazineIndex, countIndexLinks } from "@/lib/magazine-index";
import { serializeJsonLd } from "@/lib/json-ld";
import { MagazineIndexBrowser } from "./magazine-index-browser";
import "./inhalt.css";

export const revalidate = 300;

const PAGE_URL = `${SITE_URL}/magazin/inhalt`;
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
  const sections = buildMagazineIndex({ posts, pages, categories, formatDate: formatGermanDate });
  const total = countIndexLinks(sections);

  const breadcrumbGraph = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Magazin", item: `${SITE_URL}/magazin` },
      { "@type": "ListItem", position: 2, name: "Inhaltsverzeichnis", item: PAGE_URL },
    ],
  };

  return (
    <main className="shell magazine-index-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbGraph) }} />

      <nav className="magazine-index-breadcrumb" aria-label="Brotkrumen">
        <Link href="/magazin">Magazin</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Inhaltsverzeichnis</span>
      </nav>

      <section className="magazine-index-hero">
        <span className="eyebrow">Inhaltsverzeichnis</span>
        <h1>Alles aus dem Magazin – auf einen Blick.</h1>
        <p>
          {posts.length} Ratgeber-Beiträge und {pages.length} Seiten zu Hunderassen, Katzenrassen, Kleintieren und mehr.
          Tippe einfach los oder spring direkt zum Thema.
        </p>
      </section>

      <MagazineIndexBrowser sections={sections} total={total} />
    </main>
  );
}
