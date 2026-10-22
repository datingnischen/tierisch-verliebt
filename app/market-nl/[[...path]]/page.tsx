import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NlCityHub } from "@/components/nl/city-hub";
import { NlCityPage } from "@/components/nl/city-page";
import { NlBreedPage, NlMagazine } from "@/components/nl/magazine";
import { PreviewLinkRewriter } from "@/components/preview-link-rewriter";
import { getMarketCityPage, getMarketCityPages, getMarketPartnersucheHub } from "@/lib/market-partnersuche";
import { getNlBreed } from "@/lib/nl-magazine";
import { NlInfoPageView, NL_ABOUT_FAQ, NL_AUTHOR, NL_INFO_META } from "@/components/nl/info-pages";
import { NL_BREEDS, NL_INFO_PAGES, NL_LEGAL_PAGES, NL_PILOT_INDEXABLE, type NlInfoPage } from "@/lib/nl-routes";
import { staticAsset } from "#static-asset";
import { publicUrl } from "@/lib/markets";
import { serializeJsonLd } from "@/lib/json-ld";
import "@/components/nl/pilot.css";

type Props = { params: Promise<{ path?: string[] }> };

function resolve(parts: string[] = []) {
  if (!parts.length || (parts.length === 1 && parts[0] === "partnersuche")) {
    const hub = getMarketPartnersucheHub("nl");
    return { kind: "hub" as const, title: hub.title, description: hub.description };
  }
  if (parts.length === 2 && parts[0] === "partnersuche") {
    const city = getMarketCityPage("nl", parts[1]);
    if (!city) notFound();
    return { kind: "city" as const, title: city.title, description: city.description, city };
  }
  if (parts.length === 1 && (NL_INFO_PAGES as readonly string[]).includes(parts[0])) {
    const page = parts[0] as NlInfoPage;
    return { kind: "info" as const, page, title: NL_INFO_META[page].title, description: NL_INFO_META[page].description };
  }
  if (parts[0] === "magazin" && parts.length <= 2) {
    if (!parts[1] || ["hondenrassen", "kattenrassen"].includes(parts[1])) {
      const animal = parts[1] === "hondenrassen" ? "dog" as const : parts[1] === "kattenrassen" ? "cat" as const : undefined;
      return { kind: "magazine" as const, animal, title: animal === "dog" ? "Hondenrassen" : animal === "cat" ? "Kattenrassen" : "Magazine voor dierenliefhebbers", description: "Ontdek vijf hondenrassen en vijf kattenrassen: karakter, verzorging, herkomst en het leven met je huisdier." };
    }
    const entry = getNlBreed(parts[1]);
    if (!entry) notFound();
    return { kind: "breed" as const, title: entry.title, description: entry.description, entry };
  }
  notFound();
}

export function generateStaticParams() {
  return [{ path: [] }, { path: ["partnersuche"] }, ...getMarketCityPages("nl").map(city => ({ path: ["partnersuche", city.slug] })),
    { path: ["magazin"] }, { path: ["magazin", "hondenrassen"] }, { path: ["magazin", "kattenrassen"] },
    ...NL_BREEDS.map(breed => ({ path: ["magazin", breed.slug] })), ...NL_INFO_PAGES.map(page => ({ path: [page] }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parts = (await params).path || [];
  const page = resolve(parts);
  // /partnersuche/ zeigt dieselbe Stadtübersicht wie die Startseite: Canonical auf die Startseite.
  const canonical = publicUrl("nl", page.kind === "hub" ? "/" : parts.join("/"));
  const indexable = NL_PILOT_INDEXABLE && !(page.kind === "info" && NL_LEGAL_PAGES.includes(page.page));
  return { title: { absolute: `${page.title} | tierisch-verliebt.nl` }, description: page.description,
    alternates: { canonical }, robots: { index: indexable, follow: true },
    openGraph: { title: page.title, description: page.description, url: canonical, locale: "nl_NL", siteName: "tierisch-verliebt.nl", images: page.kind === "breed" ? [{ url: page.entry.image, alt: page.entry.imageAlt }] : undefined },
  };
}

export default async function NlPilot({ params }: Props) {
  const parts = (await params).path || [];
  const page = resolve(parts);
  const url = publicUrl("nl", parts.join("/"));
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", "@id": `${publicUrl("nl")}#website`, name: "tierisch-verliebt.nl", url: publicUrl("nl"), inLanguage: "nl-NL" },
    { "@type": page.kind === "info" && page.page === "over-ons" ? "AboutPage" : "WebPage", "@id": `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: "nl-NL", isPartOf: { "@id": `${publicUrl("nl")}#website` } },
    ...(page.kind === "info" && page.page === "over-ons" ? [
      { "@type": "Person", "@id": `${url}#person`, name: NL_AUTHOR.name, jobTitle: NL_AUTHOR.jobTitle, image: staticAsset(NL_AUTHOR.image), url, sameAs: NL_AUTHOR.sameAs },
      { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: NL_ABOUT_FAQ.map(entry => ({ "@type": "Question", name: entry.question, acceptedAnswer: { "@type": "Answer", text: entry.answer } })) },
    ] : []),
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: publicUrl("nl") }, ...parts.map((part, index) => ({ "@type": "ListItem", position: index + 2, name: index === parts.length - 1 ? (page.kind === "info" ? NL_INFO_META[page.page].badge : page.title) : part === "partnersuche" ? "Dating" : "Magazine", item: publicUrl("nl", parts.slice(0, index + 1).join("/")) }))] },
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }}/>
    {page.kind === "info" ? <NlInfoPageView page={page.page}/> : page.kind === "hub" ? <NlCityHub market="nl"/> : page.kind === "city" ? <NlCityPage market="nl" city={page.city}/> : page.kind === "magazine" ? <NlMagazine animal={page.animal}/> : <NlBreedPage entry={page.entry}/>}
    <PreviewLinkRewriter selector=".tvc-rich"/>
  </>;
}
