import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ItCityPage } from "@/components/it/city-page";
import { ItHome } from "@/components/it/home";
import { getItCityGuide, getItFaq, getMarketCityPage, getMarketCityPages, getMarketPartnersucheHub } from "@/lib/market-partnersuche";
import { IT_PILOT_INDEXABLE } from "@/lib/it-routes";
import { publicUrl } from "@/lib/markets";
import { serializeJsonLd } from "@/lib/json-ld";

type Props = { params: Promise<{ path?: string[] }> };

function resolve(parts: string[] = []) {
  if (!parts.length) {
    const hub = getMarketPartnersucheHub("it");
    return { kind: "home" as const, title: hub.title, metaTitle: "Single amanti degli animali in Ticino", description: hub.description };
  }
  if (parts.length === 1) {
    const city = getMarketCityPage("it", parts[0]);
    if (!city) notFound();
    return { kind: "city" as const, title: city.title, metaTitle: `Amanti degli animali a ${city.cityName}`, description: city.description, city };
  }
  notFound();
}

export function generateStaticParams() {
  return [{ path: [] }, ...getMarketCityPages("it").map((city) => ({ path: [city.slug] }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parts = (await params).path || [];
  const page = resolve(parts);
  const canonical = publicUrl("it", parts.join("/"));
  return {
    title: { absolute: `${page.metaTitle} | tierisch-verliebt.ch` },
    description: page.description,
    alternates: { canonical, languages: page.kind === "home" ? { "it-CH": canonical, "de-CH": publicUrl("ch") } : undefined },
    // Pilot: erst indexieren, wenn ICONY die italienische Registrierung ausliefert (lib/it-routes.ts).
    robots: { index: IT_PILOT_INDEXABLE, follow: true },
    openGraph: { title: page.title, description: page.description, url: canonical, locale: "it_CH", siteName: "tierisch-verliebt.ch" },
  };
}

export default async function ItPilot({ params }: Props) {
  const parts = (await params).path || [];
  const page = resolve(parts);
  const url = publicUrl("it", parts.join("/"));
  const home = publicUrl("it");
  const cityFaq = page.kind === "city" ? getItCityGuide(page.city.slug)?.faq ?? [] : [];
  const graph = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: "it-CH", isPartOf: { "@id": `${publicUrl("ch")}#website` } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Svizzera italiana", item: home },
      ...(page.kind === "city" ? [{ "@type": "ListItem", position: 2, name: page.city.cityName, item: url }] : []),
    ] },
    ...(page.kind === "home" || cityFaq.length ? [{ "@type": "FAQPage", "@id": `${url}#faq`, inLanguage: "it-CH", mainEntity: (page.kind === "home" ? getItFaq() : cityFaq).map((entry) => ({ "@type": "Question", name: entry.question, acceptedAnswer: { "@type": "Answer", text: entry.answer } })) }] : []),
  ] };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }} />
    {page.kind === "home" ? <ItHome /> : <ItCityPage city={page.city} />}
  </>;
}
