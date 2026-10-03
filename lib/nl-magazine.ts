import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { NL_BREEDS } from "#nl-routes";
import { staticAsset } from "#static-asset";
import { getMagazineFaqItems, renderMagazineFaqSection, type MagazineFaqItem } from "#magazine-faq";

export type NlBreedEntry = (typeof NL_BREEDS)[number] & {
  title: string; description: string; image: string; imageAlt: string;
  content: string; sections: { id: string; label: string }[];
  faqItems: MagazineFaqItem[];
};

export function getNlBreed(slug: string): NlBreedEntry | null {
  const breed = NL_BREEDS.find(entry => entry.slug === slug);
  if (!breed) return null;
  const file = path.join(process.cwd(), "content", "nl", "magazin", `${breed.slug}.md`);
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const sections: NlBreedEntry["sections"] = [];
  const content = renderMagazineFaqSection(parsed.content, breed.name, "nl-NL")
    .replace(/(?<=["'\s,(])\/magazin\/wp-content\/uploads\//g, `${staticAsset("/magazin/wp-content/uploads/")}`)
    .replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (_, attributes: string, html: string) => {
      const label = html.replace(/<[^>]+>/g, "").trim();
      if (!label) return `<h2${attributes}>${html}</h2>`;
      if (/id=["']faq-titel["']/.test(attributes)) {
        sections.push({ id: "faq", label });
        return `<h2${attributes}>${html}</h2>`;
      }
      const id = `sectie-${sections.length + 1}`;
      sections.push({ id, label });
      return `<h2${attributes.replace(/\s+id=["'][^"']*["']/gi, "")} id="${id}">${html}</h2>`;
    });
  return {
    ...breed, title: String(parsed.data.title), description: String(parsed.data.description),
    image: staticAsset(String(parsed.data.image)), imageAlt: String(parsed.data.imageAlt || breed.name),
    content, sections, faqItems: getMagazineFaqItems(parsed.content),
  };
}

export function getNlBreeds(animal?: "dog" | "cat"): NlBreedEntry[] {
  return NL_BREEDS.filter(breed => !animal || breed.animal === animal).map(breed => getNlBreed(breed.slug)!);
}
