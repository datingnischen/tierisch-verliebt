import { cache } from "react";
import { getMagazineEntryBySlug, SITE_URL } from "@/lib/wordpress";

export const ABOUT_OVERVIEW_PATH = "/ueber-uns";
export const ABOUT_STORY_PATH = "/ueber-uns/geschichte";
export const ABOUT_SOCIAL_MEDIA_PATH = "/ueber-uns/social-media";
export const ABOUT_PRESS_PATH = "/magazin/thema/presse";

export function canonicalMagazinePagePath(slug: string) {
  if (slug === "ueber-uns") return ABOUT_STORY_PATH;
  return `/magazin/${slug}`;
}

export function aboutOverviewCanonical() {
  return `${SITE_URL}${ABOUT_OVERVIEW_PATH}`;
}

export function aboutStoryCanonical() {
  return `${SITE_URL}${ABOUT_STORY_PATH}`;
}

export function aboutSocialMediaCanonical() {
  return `${SITE_URL}${ABOUT_SOCIAL_MEDIA_PATH}`;
}

export const getAboutStoryPage = cache(async () => {
  const entry = await getMagazineEntryBySlug("ueber-uns");
  if (!entry) {
    throw new Error('Magazine page with slug "ueber-uns" not found');
  }
  return entry;
});
