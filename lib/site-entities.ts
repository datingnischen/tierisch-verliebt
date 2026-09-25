export const BRAND_NAME = "tierisch-verliebt.de";

export const PLATFORM_OPERATOR = {
  name: "ICONY GmbH",
  url: "https://www.icony.com",
} as const;

export type SiteGraphPage = {
  type: "WebPage" | "AboutPage";
  url: string;
  name: string;
  description: string;
};

export function siteEntityIds(siteUrl: string) {
  return {
    website: `${siteUrl}#website`,
    brand: `${siteUrl}#brand`,
    operator: `${siteUrl}#operator`,
  };
}

/** Operator, brand (with its official channels as `sameAs`) and website, optionally plus the current page. */
export function buildSiteGraph({ siteUrl, sameAs, page }: { siteUrl: string; sameAs: string[]; page?: SiteGraphPage }) {
  const ids = siteEntityIds(siteUrl);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": ids.operator,
      name: PLATFORM_OPERATOR.name,
      url: PLATFORM_OPERATOR.url,
    },
    {
      "@type": "Brand",
      "@id": ids.brand,
      name: BRAND_NAME,
      url: siteUrl,
      sameAs,
    },
    {
      "@type": "WebSite",
      "@id": ids.website,
      url: siteUrl,
      name: BRAND_NAME,
      inLanguage: "de-DE",
      publisher: { "@id": ids.operator },
      about: { "@id": ids.brand },
    },
  ];

  if (page) {
    graph.push({
      "@type": page.type,
      "@id": `${page.url}#webpage`,
      url: page.url,
      name: page.name,
      description: page.description,
      inLanguage: "de-DE",
      isPartOf: { "@id": ids.website },
      about: { "@id": ids.brand },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export type MagazineArticleGraphInput = {
  siteUrl: string;
  url: string;
  type: "post" | "page";
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: { name: string; url?: string };
  category?: { name: string; url: string };
};

const BERLIN_CLOCK = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** WordPress dates come without zone; the magazine is edited in Berlin. */
export function withBerlinOffset(date?: string) {
  if (!date) return undefined;
  if (/(Z|[+-]\d{2}:\d{2})$/.test(date)) return date;
  const wallAsUtc = Date.parse(`${date}Z`);
  if (Number.isNaN(wallAsUtc)) return undefined;
  const part = Object.fromEntries(BERLIN_CLOCK.formatToParts(new Date(wallAsUtc)).map((p) => [p.type, Number(p.value)]));
  const berlinWall = Date.UTC(part.year, part.month - 1, part.day, part.hour, part.minute, part.second);
  const offsetMinutes = Math.round((berlinWall - wallAsUtc) / 60000);
  const sign = offsetMinutes < 0 ? "-" : "+";
  const abs = Math.abs(offsetMinutes);
  return `${date}${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

/** Article (posts) or WebPage (CMS pages) with breadcrumb, author, operator and the website, which points to the brand. */
export function buildMagazineArticleGraph(input: MagazineArticleGraphInput) {
  const ids = siteEntityIds(input.siteUrl);
  const pageId = `${input.url}#webpage`;
  const breadcrumbId = `${input.url}#breadcrumb`;
  const authorId = input.author?.url ? `${input.author.url}#person` : undefined;
  const isArticle = input.type === "post";
  const trail = [
    { name: "Startseite", url: input.siteUrl },
    { name: "Magazin", url: `${input.siteUrl}/magazin/` },
    ...(input.category ? [input.category] : []),
    { name: input.headline, url: input.url },
  ];

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": pageId,
      url: input.url,
      name: input.headline,
      description: input.description,
      inLanguage: "de-DE",
      isPartOf: { "@id": ids.website },
      breadcrumb: { "@id": breadcrumbId },
      primaryImageOfPage: input.image ? { "@type": "ImageObject", url: input.image } : undefined,
      datePublished: isArticle ? undefined : withBerlinOffset(input.datePublished),
      dateModified: isArticle ? undefined : withBerlinOffset(input.dateModified),
    },
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: trail.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
  ];

  if (isArticle) {
    graph.push({
      "@type": "BlogPosting",
      "@id": `${input.url}#article`,
      headline: input.headline,
      description: input.description,
      url: input.url,
      mainEntityOfPage: { "@id": pageId },
      isPartOf: { "@id": ids.website },
      inLanguage: "de-DE",
      image: input.image ? [input.image] : undefined,
      datePublished: withBerlinOffset(input.datePublished),
      dateModified: withBerlinOffset(input.dateModified ?? input.datePublished),
      articleSection: input.category?.name,
      author: input.author ? { "@type": "Person", "@id": authorId, name: input.author.name, url: input.author.url } : undefined,
      publisher: { "@id": ids.operator },
    });
  }

  graph.push(
    {
      "@type": "WebSite",
      "@id": ids.website,
      url: input.siteUrl,
      name: BRAND_NAME,
      inLanguage: "de-DE",
      publisher: { "@id": ids.operator },
      about: { "@id": ids.brand },
    },
    {
      "@type": "Organization",
      "@id": ids.operator,
      name: PLATFORM_OPERATOR.name,
      url: PLATFORM_OPERATOR.url,
    },
  );

  return { "@context": "https://schema.org", "@graph": graph };
}
