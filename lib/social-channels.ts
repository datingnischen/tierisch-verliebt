import type { AuthorSocialPlatform } from "@/lib/author-profiles";

export type SocialChannel = {
  platform: AuthorSocialPlatform;
  name: string;
  handle: string;
  kind: string;
  description: string;
  cta: string;
  href: string;
};

export const SOCIAL_CHANNELS: SocialChannel[] = [
  {
    platform: "instagram",
    name: "Instagram",
    handle: "@tierischverliebtde",
    kind: "Bilder, Reels & Storys",
    description: "Bilder, Reels und Storys aus der Tierwelt – direkt aus unserer Community.",
    cta: "Auf Instagram folgen",
    href: "https://www.instagram.com/tierischverliebtde/",
  },
  {
    platform: "tiktok",
    name: "TikTok",
    handle: "@tierisch_verliebt",
    kind: "Kurze Clips",
    description: "Kurze Clips, Trends und tierisch süße Momente aus unserer Community.",
    cta: "Auf TikTok folgen",
    href: "https://www.tiktok.com/@tierisch_verliebt",
  },
  {
    platform: "facebook",
    name: "Facebook-Seite",
    handle: "/tierischverliebt",
    kind: "News & Geschichten",
    description: "Unsere aktuellsten News und spannende Geschichten rund um tierisch-verliebt.",
    cta: "Seite liken",
    href: "https://www.facebook.com/tierischverliebt",
  },
  {
    platform: "youtube",
    name: "YouTube",
    handle: "@tierischverliebt",
    kind: "Videos",
    description: "Tipps, Erfahrungsberichte und Videos voller Tierliebe.",
    cta: "Kanal abonnieren",
    href: "https://www.youtube.com/@tierischverliebt",
  },
  {
    platform: "pinterest",
    name: "Pinterest",
    handle: "/tierischverliebt",
    kind: "Pinnwände & Ideen",
    description: "Pinnwände voller Tierliebe, Inspiration und Ideen rund ums Leben mit Haustier.",
    cta: "Auf Pinterest folgen",
    href: "https://de.pinterest.com/tierischverliebt/",
  },
];

export const SOCIAL_COMMUNITY_GROUP = {
  platform: "facebook" as const,
  name: "Die Facebook-Gruppe",
  description:
    "Hier reden nicht wir, sondern du: Tausche dich mit anderen Tierfreunden aus, zeig deine Lieblinge und finde neue Kontakte.",
  cta: "Gruppe beitreten",
  href: "https://www.facebook.com/groups/301377360796579/",
};
