import type { Metadata } from "next";
import { TierCityHub } from "@/components/city-page/tier-city-hub";
import { getMarketPartnersucheHub } from "@/lib/market-partnersuche";
import { publicUrl } from "@/lib/markets";

export const revalidate = 86400;

export function generateMetadata(): Metadata {
  const hub = getMarketPartnersucheHub("de");
  return {
    title: hub.title,
    description: hub.description,
    alternates: { canonical: publicUrl("de", "/partnersuche") },
    openGraph: { title: hub.title, description: hub.description, url: publicUrl("de", "/partnersuche") },
  };
}

export default function PartnersucheHubPage() {
  return <TierCityHub market="de" />;
}
