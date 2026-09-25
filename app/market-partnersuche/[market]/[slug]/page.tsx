import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TierCityPage } from "@/components/city-page/tier-city-page";
import { ExpertTrustCard } from "@/components/expert-trust-card";
import { PreviewLinkRewriter } from "@/components/preview-link-rewriter";
import { getAuthorProfile } from "@/lib/author-profiles";
import { getMarketCityPage, getMarketCityPages } from "@/lib/market-partnersuche";
import { isMarketCode, publicUrl, type RegionalMarket } from "@/lib/markets";

type Props={params:Promise<{market:string;slug:string}>};
function active(value:string):RegionalMarket{if(!isMarketCode(value)||value==="de")notFound();return value;}
export function generateStaticParams(){return (["at","ch"] as const).flatMap(market=>getMarketCityPages(market).map(({slug})=>({market,slug})));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const values=await params,market=active(values.market),page=getMarketCityPage(market,values.slug);if(!page)return{robots:{index:false,follow:false}};return{title:{absolute:`${page.title} | tierisch-verliebt.${market}`},description:page.description,alternates:{canonical:publicUrl(market,page.path)},robots:{index:true,follow:true},openGraph:{title:page.title,description:page.description,url:publicUrl(market,page.path),images:page.imageUrl?[page.imageUrl]:undefined}};}

export default async function MarketCity({params}:Props){const values=await params,market=active(values.market),page=getMarketCityPage(market,values.slug);if(!page)notFound();const expert=await getAuthorProfile("christian-m-haas");
  // Expertenprofil liegt nur auf der deutschen Domain, darum absolut verlinkt.
  return <><TierCityPage market={market} city={page} expert={expert?<ExpertTrustCard profile={expert} eyebrow="Unser Datingexperte" title={`Christian begleitet tierliebe Dating-Themen und regionale Einstiege auch für ${page.cityName}.`} primaryLabel="Zum Expertenprofil" primaryHref={publicUrl("de","/magazin/christian")} registrationHref={page.registrationUrl} />:null} /><PreviewLinkRewriter selector=".tvc-rich, .tvc-expert" /></>;}
