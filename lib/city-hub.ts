import maps from "../data/country-maps.json" with { type: "json" };
import { buildCityGuide, cityGeo, nearestCities, type GuideAnimal, type GuideTopic } from "./city-guide";
import { getMarketCityPages } from "./market-partnersuche";
import type { MarketCode } from "./markets";

type CountryMap = {
  width: number;
  height: number;
  path: string;
  projection: { k: number; minX: number; minY: number; scale: number; pad: number };
};

export type HubCity = {
  slug: string;
  name: string;
  path: string;
  imageUrl: string | null;
  region: string;
  chapters: number;
  tips: number;
  topics: GuideTopic[];
  hasCats: boolean;
  nearest: { name: string; km: number } | null;
  x: number;
  y: number;
  label: { x: number; y: number; anchor: "start" | "end" | "middle" } | null;
};

export type CityHubData = {
  map: { width: number; height: number; path: string };
  cities: HubCity[];
  regions: string[];
  totals: { cities: number; regions: number; chapters: number; tips: number; catCities: number; animals: GuideAnimal[]; topicCounts: Partial<Record<GuideTopic, number>> };
};

const LABEL_SIZE = 38;

export function projectPoint(map: CountryMap, lat: number, lon: number) {
  const { k, minX, minY, scale, pad } = map.projection;
  return { x: (lon * k - minX) * scale + pad, y: (-lat - minY) * scale + pad };
}

type Box = { x1: number; y1: number; x2: number; y2: number };
const overlaps = (a: Box, b: Box) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;

/** Beschriftungen gierig platzieren: rechts, links, oben, unten – sonst weglassen (Pin bleibt klickbar). */
function placeLabels(cities: Omit<HubCity, "label">[], width: number, height: number): HubCity[] {
  const pins: Box[] = cities.map((city) => ({ x1: city.x - 21, y1: city.y - 21, x2: city.x + 21, y2: city.y + 21 }));
  const placed: Box[] = [];
  return cities.map((city) => {
    const w = city.name.length * LABEL_SIZE * 0.6;
    const h = LABEL_SIZE;
    const options: { box: Box; label: NonNullable<HubCity["label"]> }[] = [
      { box: { x1: city.x + 26, y1: city.y - h / 2, x2: city.x + 26 + w, y2: city.y + h / 2 }, label: { x: city.x + 26, y: city.y + 13, anchor: "start" } },
      { box: { x1: city.x - 26 - w, y1: city.y - h / 2, x2: city.x - 26, y2: city.y + h / 2 }, label: { x: city.x - 26, y: city.y + 13, anchor: "end" } },
      { box: { x1: city.x - w / 2, y1: city.y - 22 - h, x2: city.x + w / 2, y2: city.y - 22 }, label: { x: city.x, y: city.y - 28, anchor: "middle" } },
      { box: { x1: city.x - w / 2, y1: city.y + 22, x2: city.x + w / 2, y2: city.y + 22 + h }, label: { x: city.x, y: city.y + 52, anchor: "middle" } },
    ];
    const fit = options.find(({ box }) =>
      box.x1 >= 0 && box.x2 <= width && box.y1 >= 0 && box.y2 <= height
      && !placed.some((other) => overlaps(box, other))
      && !pins.some((pin, index) => cities[index].slug !== city.slug && overlaps(box, pin)));
    if (fit) placed.push(fit.box);
    return { ...city, label: fit?.label ?? null };
  });
}

export function getCityHubData(market: MarketCode): CityHubData {
  const map = (maps as Record<MarketCode, CountryMap>)[market];
  const pages = getMarketCityPages(market);
  const raw = pages.map((page) => {
    const guide = buildCityGuide(page);
    const geo = cityGeo(market, page.slug);
    const point = geo ? projectPoint(map, geo.lat, geo.lon) : { x: -100, y: -100 };
    const near = nearestCities(market, page.slug, pages, 1)[0];
    return {
      slug: page.slug,
      name: page.cityName,
      path: page.path,
      imageUrl: page.imageUrl ?? null,
      region: geo?.region ?? "",
      chapters: Math.max(guide.sections.length, 1),
      tips: guide.tipCount,
      topics: guide.topics.slice(0, 4),
      hasCats: guide.sections.some((section) => section.topic === "cat") || guide.animals.includes("katze"),
      nearest: near ? { name: near.cityName, km: near.km } : null,
      x: Math.round(point.x),
      y: Math.round(point.y),
      animals: guide.animals,
      allTopics: guide.topics,
    };
  });
  const cities = placeLabels(raw.map(({ animals: _animals, allTopics: _topics, ...city }) => city), map.width, map.height);
  const regions = [...new Set(cities.map((city) => city.region).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
  const topicCounts: Partial<Record<GuideTopic, number>> = {};
  for (const city of raw) for (const topic of city.allTopics) topicCounts[topic] = (topicCounts[topic] ?? 0) + 1;
  const animals = (["hund", "katze", "pferd", "kleintier", "vogel"] as GuideAnimal[]).filter((animal) => raw.some((city) => city.animals.includes(animal)));
  return {
    map: { width: map.width, height: map.height, path: map.path },
    cities,
    regions,
    totals: {
      cities: cities.length,
      regions: regions.length,
      chapters: cities.reduce((sum, city) => sum + city.chapters, 0),
      tips: cities.reduce((sum, city) => sum + city.tips, 0),
      catCities: raw.filter((city) => city.animals.includes("katze")).length,
      animals,
      topicCounts,
    },
  };
}
