import type { MetadataRoute } from "next";
import { ABOUT_OVERVIEW_PATH, ABOUT_SOCIAL_MEDIA_PATH, ABOUT_STORY_PATH } from "@/lib/about-section";
import { getKnownAuthorSlugs } from "@/lib/author-profiles";
import { getMarketCityPages } from "@/lib/market-partnersuche";
import { SITE_URL, getMagazineCategories, getMagazinePages, getMagazinePosts } from "@/lib/wordpress";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, pages, categories, authors] = await Promise.all([
    getMagazinePosts(),
    getMagazinePages(),
    getMagazineCategories(),
    getKnownAuthorSlugs(),
  ]);

  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/magazin`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/partnersuche`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}${ABOUT_OVERVIEW_PATH}`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}${ABOUT_STORY_PATH}`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}${ABOUT_SOCIAL_MEDIA_PATH}`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/magazin/${post.slug}`,
      lastModified: post.modified || post.date,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...pages
      .filter((page) => page.slug !== "ueber-uns")
      .map((page) => ({
      url: `${SITE_URL}/magazin/${page.slug}`,
      lastModified: page.modified || page.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...categories.map((category) => ({
      url: `${SITE_URL}/magazin/thema/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...authors.map((slug) => ({
      url: `${SITE_URL}/magazin/author/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...getMarketCityPages("de").map((page) => ({
      url: `${SITE_URL}${page.path}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
