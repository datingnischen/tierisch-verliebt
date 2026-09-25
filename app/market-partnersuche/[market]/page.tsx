import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TierCityHub } from "@/components/city-page/tier-city-hub";
import { getMarketPartnersucheHub } from "@/lib/market-partnersuche";
import { isMarketCode, publicUrl, type RegionalMarket } from "@/lib/markets";

type Props = { params: Promise<{ market: string }> };

function active(value: string): RegionalMarket {
  if (!isMarketCode(value) || value === "de") notFound();
  return value;
}

export function generateStaticParams() {
  return [{ market: "at" }, { market: "ch" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const market = active((await params).market);
  const hub = getMarketPartnersucheHub(market);
  return {
    title: { absolute: `${hub.title} | tierisch-verliebt.${market}` },
    description: hub.description,
    alternates: { canonical: publicUrl(market, "/partnersuche") },
    robots: { index: true, follow: true },
    openGraph: { title: hub.title, description: hub.description, url: publicUrl(market, "/partnersuche") },
  };
}

export default async function MarketHub({ params }: Props) {
  const market = active((await params).market);
  return <TierCityHub market={market} />;
}
