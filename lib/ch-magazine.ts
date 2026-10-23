import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { CH_MAGAZINE_SLUGS, publicUrl } from "#markets";
import { staticAsset } from "#static-asset";

export type ChArticle = {
  slug: string; title: string; seoTitle: string; description: string; teaser: string;
  category: string; published: string; updated: string; content: string;
  image: string; imageAlt: string; imageWidth: number; imageHeight: number;
  sections: { id: string; label: string }[];
  faq: { question: string; answer: string }[];
  readingMinutes: number;
};

const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export function getChArticle(slug: string): ChArticle | null {
  if (!CH_MAGAZINE_SLUGS.some(value => value === slug)) return null;
  const parsed = matter(fs.readFileSync(path.join(process.cwd(), "content/ch/magazin", `${slug}.md`), "utf8"));
  if (parsed.data.draft === true) return null;
  const d = parsed.data;
  const content = parsed.content.trim();
  const sections = [...content.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map(m => ({ id: m[1], label: m[2] }));
  // Nur sichtbare FAQ-Details, nicht den Quellenblock, in strukturierte Daten übernehmen.
  const faq = [...content.matchAll(/<details><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)]
    .map(m => ({ question: plain(m[1]), answer: plain(m[2]) }));
  return {
    slug, title: String(d.title), seoTitle: String(d.seoTitle), description: String(d.description), teaser: String(d.teaser),
    category: String(d.category), published: String(d.published), updated: String(d.updated), content,
    image: String(d.image), imageAlt: String(d.imageAlt), imageWidth: Number(d.imageWidth), imageHeight: Number(d.imageHeight),
    sections, faq, readingMinutes: Math.max(1, Math.ceil(plain(content).split(/\s+/).length / 200)),
  };
}

export function getChArticles(): ChArticle[] {
  return CH_MAGAZINE_SLUGS.map(getChArticle).filter((article): article is ChArticle => article !== null);
}

export function chMagazineGraph(article?: ChArticle) {
  const root = publicUrl("ch", "/magazin");
  const url = article ? publicUrl("ch", `/magazin/${article.slug}`) : root;
  const crumbs = [
    { "@type": "ListItem", position: 1, name: "Start", item: publicUrl("ch") },
    { "@type": "ListItem", position: 2, name: "Magazin", item: root },
    ...(article ? [{ "@type": "ListItem", position: 3, name: article.title, item: url }] : []),
  ];
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "BreadcrumbList", itemListElement: crumbs },
    article ? {
      "@type": "Article", "@id": `${url}#article`, url, mainEntityOfPage: url, headline: article.title,
      description: article.description, inLanguage: "de-CH", datePublished: article.published, dateModified: article.updated,
      image: { "@type": "ImageObject", url: staticAsset(article.image), width: article.imageWidth, height: article.imageHeight },
      author: { "@type": "Organization", name: "Redaktion tierisch-verliebt.ch", url: root },
    } : {
      "@type": "CollectionPage", url, name: "Magazin für tierliebe Singles in der Schweiz", inLanguage: "de-CH",
      mainEntity: { "@type": "ItemList", itemListElement: getChArticles().map((entry, index) => ({
        "@type": "ListItem", position: index + 1, url: publicUrl("ch", `/magazin/${entry.slug}`), name: entry.title,
      })) },
    },
    ...(article?.faq.length ? [{ "@type": "FAQPage", "@id": `${url}#faq`, inLanguage: "de-CH", mainEntity: article.faq.map(item => ({
      "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer },
    })) }] : []),
  ] };
}
