import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const DEFAULT_ASSET_HOST = "https://tierisch-verliebt.vercel.app";
const DEFAULT_ASSET_PATH_PREFIX = "/app-assets";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeAssetPathPrefix(value: string) {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  const trimmed = trimTrailingSlash(withLeadingSlash);
  return trimmed || DEFAULT_ASSET_PATH_PREFIX;
}

export default function nextConfig(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const assetHost = trimTrailingSlash(process.env.NEXT_PUBLIC_ASSET_HOST || DEFAULT_ASSET_HOST);
  const assetPathPrefix = normalizeAssetPathPrefix(
    process.env.NEXT_PUBLIC_ASSET_PATH_PREFIX || DEFAULT_ASSET_PATH_PREFIX,
  );

  return {
    turbopack: { root: process.cwd() },
    // Seiten-URLs enden auf "/" wie auf der ICONY-Plattform. Die Umleitung übernimmt proxy.ts,
    // weil nur dort das interne Länderpräfix (/at/…, /ch/…) bekannt ist.
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    assetPrefix: isDev ? undefined : `${assetHost}${assetPathPrefix}`,
    // Magazin-Inhalte liegen als Dateien im Repo; sie müssen in jede Serverless-Funktion gepackt werden.
    outputFileTracingIncludes: {
      "/**": ["./content/magazin/**/*", "./content/nl/magazin/**/*", "./content/ch/magazin/**/*", "./content/at/magazin/**/*", "./content/ueber-uns/*.md", "./data/magazin/*.json"],
    },
    async redirects() {
      // Alte WordPress-URLs unter /magazin/ (Autoren-Platzhalter, Archive, Feeds, Sitemaps, Admin).
      // Die Sitemap bleibt unter /magazin/sitemap.xml: Auf der Live-Domain reicht nginx nur /magazin/… an Vercel
      // durch, /sitemap.xml beantwortet die ICONY-Plattform mit 404 (robots.txt dort verweist auf sitemap.php).
      // Auf der Live-Domain gelten die Pfade ohne Präfix; nginx reicht sie intern als /de/… an Vercel weiter.
      const legacy: Array<[string, string]> = [
        ["/magazin/author/redaktion", "/magazin/christian/"],
        ["/magazin/author/tierliebe", "/magazin/christian/"],
        ["/magazin/category/:slug", "/magazin/thema/:slug/"],
        ["/magazin/tag/:slug", "/magazin/"],
        ["/magazin/feed", "/magazin/"],
        ["/magazin/comments/feed", "/magazin/"],
        ["/magazin/wp-sitemap.xml", "/magazin/sitemap.xml"],
        ["/magazin/sitemap_index.xml", "/magazin/sitemap.xml"],
        ["/magazin/wp-login.php", "/magazin/"],
        ["/magazin/wp-admin/:path*", "/magazin/"],
        // Einzelbeitrag vom 18.10.2026 in der Sammelseite „Bekannt aus“ aufgegangen.
        ["/magazin/meinbezirk-gastbeitrag-tierliebe-singles", "/magazin/bekannt-aus/"],
      ];
      return legacy.flatMap(([source, destination]) => [
        { source, destination, permanent: true },
        // nginx ruft Vercel live mit /de/… auf; das Ziel bleibt ohne Präfix, sonst landet der Besucher auf /de/… (404).
        { source: `/de${source}`, destination, permanent: true },
      ]);
    },
    async rewrites() {
      return [
        {
          source: `${assetPathPrefix}/:path*`,
          destination: "/:path*",
        },
      ];
    },
  };
}
