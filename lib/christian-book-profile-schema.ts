export type StructuredDataNode = Record<string, unknown>;

export type ProfileBreadcrumbItem = { name: string; url: string };

type ChristianBookProfileInput = {
  slug: string;
  christianSlug: string;
  content: string;
  canonicalUrl: string;
  siteUrl: string;
  profileName: string;
  profileDescription: string;
  profileImage?: string;
  jobTitle?: string;
  sameAs?: string[];
  knowsAbout?: string[];
  breadcrumb: ProfileBreadcrumbItem[];
  dateModified?: string;
  aboutPageUrl?: string;
};

const BOOK_MARKER_START = "<!-- dating-ohne-bullshit-book:start -->";
const BOOK_MARKER_END = "<!-- dating-ohne-bullshit-book:end -->";
const BOOK_SCHEMA_START = "<!-- dating-ohne-bullshit-schema:start -->";
const BOOK_SCHEMA_END = "<!-- dating-ohne-bullshit-schema:end -->";

/** The platform operator named in the imprint; the person is affiliated with it, not employed by it. */
export const PLATFORM_OPERATOR = {
  name: "ICONY GmbH",
  url: "https://www.icony.com",
} as const;

export const BRAND_NAME = "tierisch-verliebt.de";

/** Facts printed inside the CMS book block, mirrored here so the markup stays backed by the page. */
export const PUBLISHED_BOOK = {
  name: "Dating ohne Bullshit",
  subtitle: "Der ungeschönte Insiderblick ins Online-Dating-Business",
  isbn: "9783696371210",
  datePublished: "2026-08-21",
  numberOfPages: 136,
  edition: "1. Auflage",
  publisher: "BoD – Books on Demand",
  amazonUrl: "https://www.amazon.de/dp/3696371211/",
} as const;

export function stripPublishedBookSchema(content: string) {
  let result = content;
  let start = result.indexOf(BOOK_SCHEMA_START);
  while (start >= 0) {
    const end = result.indexOf(BOOK_SCHEMA_END, start + BOOK_SCHEMA_START.length);
    if (end < 0) break;
    result = result.slice(0, start) + result.slice(end + BOOK_SCHEMA_END.length);
    start = result.indexOf(BOOK_SCHEMA_START);
  }
  return result;
}

function extractBoundedBookImage(content: string) {
  const starts = content.split(BOOK_MARKER_START).length - 1;
  const ends = content.split(BOOK_MARKER_END).length - 1;
  if (starts !== 1 || ends !== 1) return null;

  const start = content.indexOf(BOOK_MARKER_START) + BOOK_MARKER_START.length;
  const end = content.indexOf(BOOK_MARKER_END, start);
  if (end < start) return null;

  const markerBlock = content.slice(start, end);
  const imageMatch = markerBlock.match(/<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1/i);
  if (!imageMatch) return null;

  try {
    const imageUrl = new URL(imageMatch[2].replace(/&amp;/gi, "&"));
    return imageUrl.protocol === "https:" || imageUrl.protocol === "http:" ? imageUrl.toString() : null;
  } catch {
    return null;
  }
}

export function buildChristianBookProfileGraph(input: ChristianBookProfileInput) {
  if (input.slug !== input.christianSlug) return null;
  const bookImage = extractBoundedBookImage(input.content);
  if (!bookImage) return null;

  const personId = `${input.canonicalUrl}#person`;
  const pageId = `${input.canonicalUrl}#profile-page`;
  const breadcrumbId = `${input.canonicalUrl}#breadcrumb`;
  const websiteId = `${input.siteUrl}#website`;
  const operatorId = `${input.siteUrl}#operator`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": operatorId,
        name: PLATFORM_OPERATOR.name,
        url: PLATFORM_OPERATOR.url,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: input.siteUrl,
        name: BRAND_NAME,
        inLanguage: "de-DE",
        publisher: { "@id": operatorId },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: input.breadcrumb.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      },
      {
        "@type": "ProfilePage",
        "@id": pageId,
        url: input.canonicalUrl,
        name: input.profileName,
        description: input.profileDescription,
        isPartOf: { "@id": websiteId },
        breadcrumb: { "@id": breadcrumbId },
        mainEntity: { "@id": personId },
        primaryImageOfPage: input.profileImage,
        dateModified: input.dateModified,
        inLanguage: "de-DE",
      },
      {
        "@type": "Person",
        "@id": personId,
        name: input.profileName,
        description: input.profileDescription,
        url: input.canonicalUrl,
        mainEntityOfPage: { "@id": pageId },
        image: input.profileImage,
        jobTitle: input.jobTitle,
        affiliation: { "@id": operatorId },
        publishingPrinciples: input.aboutPageUrl,
        sameAs: input.sameAs?.length ? input.sameAs : undefined,
        knowsAbout: input.knowsAbout?.length ? input.knowsAbout : undefined,
      },
      {
        "@type": "Book",
        "@id": `${input.canonicalUrl}#book-${PUBLISHED_BOOK.isbn}`,
        name: PUBLISHED_BOOK.name,
        alternateName: PUBLISHED_BOOK.subtitle,
        author: { "@id": personId },
        isbn: PUBLISHED_BOOK.isbn,
        datePublished: PUBLISHED_BOOK.datePublished,
        inLanguage: "de-DE",
        bookFormat: "https://schema.org/Paperback",
        bookEdition: PUBLISHED_BOOK.edition,
        numberOfPages: PUBLISHED_BOOK.numberOfPages,
        publisher: { "@type": "Organization", name: PUBLISHED_BOOK.publisher },
        url: PUBLISHED_BOOK.amazonUrl,
        image: bookImage,
      },
    ],
  };
}
