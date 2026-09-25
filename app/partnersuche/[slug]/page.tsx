import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TierCityPage } from "@/components/city-page/tier-city-page";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { PreviewLinkRewriter } from "@/components/preview-link-rewriter";
import { getAuthorProfile } from "@/lib/author-profiles";
import { getMarketCityPage, getMarketCityPages } from "@/lib/market-partnersuche";
import { publicUrl } from "@/lib/markets";

type PageProps = { params: Promise<{ slug: string }> };

export const revalidate = 86400;

export function generateStaticParams() {
  return getMarketCityPages("de").map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getMarketCityPage("de", slug);
  if (!city) return {};
  return {
    title: city.title,
    description: city.description,
    alternates: { canonical: publicUrl("de", city.path) },
    openGraph: {
      title: city.title,
      description: city.description,
      url: publicUrl("de", city.path),
      images: city.imageUrl ? [city.imageUrl] : undefined,
    },
  };
}

export default async function PartnersucheCityPage({ params }: PageProps) {
  const { slug } = await params;
  const [city, expert] = [getMarketCityPage("de", slug), await getAuthorProfile("christian-m-haas")];
  if (!city) notFound();

  return (
    <>
    <TierCityPage
      market="de"
      city={city}
      expert={expert ? <ExpertTrustCard profile={expert} eyebrow="Unser Datingexperte" title={`Christian begleitet tierliebe Dating-Themen und regionale Einstiege auch für ${city.cityName}.`} primaryLabel="Zum Expertenprofil" registrationHref={city.registrationUrl} /> : null}
    />
    <PreviewLinkRewriter selector=".tvc-rich" />
    </>
  );
}
