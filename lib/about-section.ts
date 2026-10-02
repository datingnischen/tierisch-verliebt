import { cache } from "react";
import { getMagazineEntryBySlug, SITE_URL } from "@/lib/magazine";
import { withTrailingSlash } from "@/lib/markets";

export const ABOUT_OVERVIEW_PATH = "/ueber-uns";
export const ABOUT_STORY_PATH = "/ueber-uns/geschichte";
export const ABOUT_SOCIAL_MEDIA_PATH = "/ueber-uns/social-media";
/** Standard aller Projekte: ICONY-Seite „Bewertung und Erfahrungen“ unter /ueber-uns/bewertungen. */
export const ABOUT_REVIEWS_PATH = "/ueber-uns/bewertungen";
export const ABOUT_PRESS_PATH = "/magazin/thema/presse";
/** Seitensuche neben Über uns – /suche gehört auf der Live-Domain der ICONY-Plattform. */
export const ABOUT_SEARCH_PATH = "/ueber-uns/suche";

export function canonicalMagazinePagePath(slug: string) {
  if (slug === "ueber-uns") return ABOUT_STORY_PATH;
  return `/magazin/${slug}`;
}

export function aboutOverviewCanonical() {
  return `${SITE_URL}${withTrailingSlash(ABOUT_OVERVIEW_PATH)}`;
}

export function aboutStoryCanonical() {
  return `${SITE_URL}${withTrailingSlash(ABOUT_STORY_PATH)}`;
}

export function aboutReviewsCanonical() {
  return `${SITE_URL}${withTrailingSlash(ABOUT_REVIEWS_PATH)}`;
}

export function aboutSearchCanonical() {
  return `${SITE_URL}${withTrailingSlash(ABOUT_SEARCH_PATH)}`;
}

export function aboutSocialMediaCanonical() {
  return `${SITE_URL}${withTrailingSlash(ABOUT_SOCIAL_MEDIA_PATH)}`;
}

export const getAboutStoryPage = cache(async () => {
  const entry = await getMagazineEntryBySlug("ueber-uns");
  if (!entry) {
    throw new Error('Magazine page with slug "ueber-uns" not found');
  }
  return entry;
});
