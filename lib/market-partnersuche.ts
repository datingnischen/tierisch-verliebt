import data from "../data/partnersuche-markets.json" with { type: "json" };
import type { MarketCode } from "./markets.ts";

export type MarketCityPage = {
  market: MarketCode;
  slug: string;
  path: string;
  sourceUrl: string;
  title: string;
  description: string;
  cityName: string;
  lead: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  contentHtml: string;
  sourceAttributionUrl?: string | null;
  registrationUrl: string;
  searchUrl: string;
  icony: {
    platformId: string;
    zip: string;
    country: number;
    frameUrl: string;
  };
};

type RawMarket = {
  market: MarketCode;
  title: string;
  description: string;
  pages: MarketCityPage[];
};

const imports = data as Record<MarketCode, RawMarket>;

const HUB_COPY: Record<MarketCode, { title: string; description: string }> = {
  de: {
    title: "Finde tierliebe Singles aus deiner Region",
    description: "Wähle deine Stadt und entdecke tierliebe Singles, lokale Treffpunkte und hilfreiche Tipps für einen entspannten Einstieg.",
  },
  at: {
    title: "Tierliebe Partnersuche in Österreich",
    description: "Entdecke tierliebe Singles und regionale Tipps in 15 österreichischen Städten – von Wien und Graz bis Bregenz und Eisenstadt.",
  },
  ch: {
    title: "Tierliebe Partnersuche in der Schweiz",
    description: "Entdecke tierliebe Singles und regionale Tipps in 15 Schweizer Städten – von Zürich und Bern bis Genf, Chur und Aarau.",
  },
};

export function getMarketCityPages(market: MarketCode): MarketCityPage[] {
  return imports[market].pages;
}

export function getMarketCityPage(market: MarketCode, slug: string): MarketCityPage | null {
  return imports[market].pages.find((page) => page.slug === slug) ?? null;
}

export function getMarketPartnersucheHub(market: MarketCode) {
  const copy = HUB_COPY[market];
  return {
    market,
    title: copy.title,
    description: copy.description,
    cities: imports[market].pages.map((page) => ({
      slug: page.slug,
      cityName: page.cityName,
      href: page.path,
      imageUrl: page.imageUrl,
      imageAlt: page.imageAlt,
      description: page.description,
    })),
  };
}

export function getNearbyMarketCities(market: MarketCode, slug: string, count = 6) {
  const pages = getMarketCityPages(market);
  const index = pages.findIndex((page) => page.slug === slug);
  const ordered = index >= 0 ? [...pages.slice(index + 1), ...pages.slice(0, index)] : pages;
  return ordered.slice(0, count);
}
