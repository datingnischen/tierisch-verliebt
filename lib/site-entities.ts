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
