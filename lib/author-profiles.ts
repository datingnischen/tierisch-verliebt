import { cache } from "react";
import { getMagazineEntryBySlug, getMagazinePosts, stripHtml } from "@/lib/wordpress";

const AUTHOR_ARCHIVE_BASE = "https://tierisch-verliebt.de/magazin/author";

export type AuthorProfileLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type AuthorProfile = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  profileUrl: string;
  facts: string[];
  intro?: string;
  story?: string[];
  expertise?: string[];
  links?: AuthorProfileLink[];
  quote?: string;
};

function firstMatch(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  return match?.[1]?.trim() || "";
}

export const getAuthorProfile = cache(async (slug: string): Promise<AuthorProfile | null> => {
  const posts = await getMagazinePosts();
  const authorPosts = posts.filter((post) => post.authorSlug === slug);
  if (!authorPosts.length && slug !== "christian-m-haas" && slug !== "redaktion") return null;

  if (slug === "christian-m-haas") {
    const entry = await getMagazineEntryBySlug("christian");
    const imageUrl = entry ? firstMatch(entry.content, /<img[^>]+(?:src|data-src)="([^"]+)"/i) || undefined : undefined;
    const bio = entry ? stripHtml(entry.excerpt || entry.content).slice(0, 280) : "";

    return {
      slug,
      name: "Christian M. Haas",
      role: "Gründer von tierisch-verliebt.de, Datingexperte und Tierliebhaber",
      bio:
        bio ||
        "Christian M. Haas verbindet fundierte Dating-Erfahrung mit echter Tiernähe und schreibt über Kennenlernen, Beziehungen und den Alltag von Menschen, für die Haustiere selbstverständlich zur Familie gehören.",
      intro:
        "Christian M. Haas entwickelt seit vielen Jahren Angebote für themenspezifisches Online-Dating. Bei tierisch-verliebt.de bringt er dieses Know-how mit einer sehr persönlichen Tierverbundenheit zusammen – für ein Magazin, das nahbar, glaubwürdig und alltagsrelevant bleibt.",
      imageUrl,
      profileUrl: "/magazin/christian",
      facts: [
        "Langjährige Erfahrung mit Dating-Portalen und spezialisierten Communities",
        "Persönlicher Tieralltag mit zwei Katzen und drei Graupapageien",
        `Bereits ${authorPosts.length} veröffentlichte Beiträge im Magazin`,
      ],
      story: [
        "Die Idee für tierisch-verliebt.de entstand nicht am Reißbrett, sondern aus echter persönlicher Nähe zu Tieren. Schon seit seiner Kindheit begleiten Tiere Christians Alltag – vom ersten Nymphensittich bis zu den Haustieren, die heute fest zur Familie gehören.",
        "Diese Erfahrung prägt auch seinen Blick auf Partnersuche und Beziehungen: Wer Tiere liebt, sucht oft nicht nur einen Menschen, sondern einen Lebensstil, in dem Verantwortung, Fürsorge und gemeinsame Werte zusammenpassen.",
        "Im Magazin schreibt Christian deshalb über tierfreundliche Partnersuche, Beziehungsfragen, Community-Themen und den Alltag mit Haustieren – in einer Sprache, die verständlich, seriös und nah an der Lebensrealität der Leserinnen und Leser bleibt.",
      ],
      expertise: [
        "Tierfreundliche Partnersuche und spezialisierte Dating-Communities",
        "Beziehungsalltag mit Hund, Katze, Vogel und anderen Haustieren",
        "Praxisnahe Magazin-Inhalte mit Fokus auf Vertrauen, Nähe und gemeinsame Werte",
      ],
      links: [
        { label: "Ausführliche Vita", href: "/magazin/christian" },
        { label: "Datingnischen.de", href: "https://datingnischen.de/christian", external: true },
        { label: "LinkedIn-Profil", href: "https://www.linkedin.com/in/christian-m-haas-457323379", external: true },
      ],
      quote:
        "Menschen lernen sich oft leichter kennen, wenn Tiere im Alltag nicht erklärt werden müssen, sondern selbstverständlich dazugehören.",
    };
  }

  const url = `${AUTHOR_ARCHIVE_BASE}/${slug}/`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Amigo tierisch-verliebt author profile sync" },
    next: { revalidate: 300 },
  } as RequestInit & { next: { revalidate: number } });

  const html = response.ok ? await response.text() : "";
  const name = stripHtml(firstMatch(html, /<h1 class="archive-title">[\s\S]*?<span>([\s\S]*?)<\/span>[\s\S]*?<\/h1>/i)) || "Redaktion";

  return {
    slug,
    name,
    role: "Redaktion für tierliebe Singles, Ratgeber und Haustier-Themen",
    bio:
      "Die Redaktion sammelt Tipps, Tierwissen und Dating-Impulse für Menschen, bei denen Hund, Katze oder andere Haustiere fest zum Leben dazugehören.",
    intro:
      "Die redaktionellen Inhalte bündeln praktische Tipps, Magazin-Themen und alltagsnahe Orientierung für Tierfreundinnen und Tierfreunde, die passende Kontakte mit gemeinsamen Werten suchen.",
    profileUrl: `/magazin/author/${slug}`,
    facts: [
      "Fokus auf tierliebe Singles und gemeinsame Lebensstile",
      "Kuratierte Ratgeber zu Hund, Katze und weiteren Tierwelten",
      `Bereits ${authorPosts.length} veröffentlichte Beiträge im Magazin`,
    ],
    story: [
      "Die Redaktion bereitet Inhalte so auf, dass Tierwissen, Partnersuche und Alltagsthemen sinnvoll zusammenfinden.",
      "Im Mittelpunkt stehen verständliche Empfehlungen, klare Einstiege und Themen, die für Tierhalterinnen und Tierhalter wirklich relevant sind.",
    ],
    expertise: [
      "Ratgeber für Hunde, Katzen und weitere Tierwelten",
      "Alltagsnahe Themen für tierliebe Singles und Paare",
      "Magazin-Inhalte mit klarem Fokus auf Vertrauen und Verständlichkeit",
    ],
  };
});

export const getKnownAuthorSlugs = cache(async (): Promise<string[]> => {
  const posts = await getMagazinePosts();
  const slugs = new Set(posts.map((post) => post.authorSlug).filter(Boolean) as string[]);
  return [...slugs];
});

export const getAuthorPosts = cache(async (slug: string) => {
  const posts = await getMagazinePosts();
  return posts.filter((post) => post.authorSlug === slug);
});
