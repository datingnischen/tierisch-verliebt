import { cache } from "react";
import { getMagazineEntryBySlug, getMagazinePosts, stripHtml } from "@/lib/wordpress";

const AUTHOR_ARCHIVE_BASE = "https://tierisch-verliebt.de/magazin/author";

export type AuthorProfile = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  profileUrl: string;
  facts: string[];
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
      role: "Datingexperte, Tierliebhaber und Betreiber von tierisch-verliebt.de",
      bio:
        bio ||
        "Christian M. Haas verbindet langjährige Dating-Erfahrung mit echter Tierliebe und schreibt über Kennenlernen, Haustiere und Beziehungen mit gemeinsamen Werten.",
      imageUrl,
      profileUrl: "/magazin/author/christian-m-haas",
      facts: [
        "Langjährige Erfahrung mit Dating-Portalen und Nischen-Communities",
        "Tierliebe als echter Mittelpunkt der Plattformidee",
        `Bereits ${authorPosts.length} veröffentlichte Beiträge im Magazin`,
      ],
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
    profileUrl: `/magazin/author/${slug}`,
    facts: [
      "Fokus auf tierliebe Singles und gemeinsame Lebensstile",
      "Kuratierte Ratgeber zu Hund, Katze und weiteren Tierwelten",
      `Bereits ${authorPosts.length} veröffentlichte Beiträge im Magazin`,
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
