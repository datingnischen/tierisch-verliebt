import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconySinglesWidget } from "@/components/icony-singles-widget";
import { MarketLink } from "@/components/market-link";
import { getMarketCityPage, getMarketCityPages, getNearbyMarketCities } from "@/lib/market-partnersuche";
import { isMarketCode, publicUrl, type RegionalMarket } from "@/lib/markets";

type Props={params:Promise<{market:string;slug:string}>};
function active(value:string):RegionalMarket{if(!isMarketCode(value)||value==="de")notFound();return value;}
export function generateStaticParams(){return (["at","ch"] as const).flatMap(market=>getMarketCityPages(market).map(({slug})=>({market,slug})));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const values=await params,market=active(values.market),page=getMarketCityPage(market,values.slug);if(!page)return{robots:{index:false,follow:false}};return{title:{absolute:`${page.title} | tierisch-verliebt.${market}`},description:page.description,alternates:{canonical:publicUrl(market,page.path)},robots:{index:true,follow:true},openGraph:{title:page.title,description:page.description,url:publicUrl(market,page.path),images:page.imageUrl?[page.imageUrl]:undefined}};}

export default async function MarketCity({params}:Props){const values=await params,market=active(values.market),page=getMarketCityPage(market,values.slug);if(!page)notFound();const nearby=getNearbyMarketCities(market,page.slug);return <main className="shell shell-narrow">
<section className="hero-card hero-brand"><span className="eyebrow">Tierliebe Partnersuche in {page.cityName}</span><h1>{page.title}</h1><p>{page.description}</p><div className="chip-row"><span className="trust-chip">Profile aus der Region</span><span className="trust-chip">Tipps für Tierfreunde</span><span className="trust-chip">Kostenlos starten</span></div><div className="button-row"><a className="button button-primary" href={page.registrationUrl}>Tierliebe Singles in {page.cityName} finden</a><MarketLink className="button button-secondary" market={market} path="/partnersuche">Alle Städte</MarketLink></div></section>
<section className="content-section"><IconySinglesWidget city={page.cityName} zip={page.icony.zip} country={page.icony.country} platformId={page.icony.platformId} registrationUrl={page.registrationUrl} searchUrl={page.searchUrl} /></section>
<section className="content-section"><article className="panel-card"><div className="section-header"><span className="eyebrow">Tipps & Highlights vor Ort</span><h2>Tierfreundliche Orte und Ideen für {page.cityName}</h2></div><div className="rich-content" dangerouslySetInnerHTML={{__html:page.contentHtml}} />{page.sourceAttributionUrl?<p className="source-note">Bildquelle: <a href={page.sourceAttributionUrl} target="_blank" rel="noreferrer">Originalquelle</a></p>:null}</article></section>
<section className="content-section"><article className="panel-card"><div className="section-header"><span className="eyebrow">Weitere Städte</span><h2>Mehr regionale Einstiege</h2></div><div className="city-grid city-grid-compact">{nearby.map(city=><MarketLink key={city.slug} className="city-card" market={market} path={city.path}><span className="eyebrow eyebrow-muted">Tierliebe Singles</span><h3>{city.cityName}</h3><p>Singles {city.cityName} entdecken</p></MarketLink>)}</div></article></section>
</main>;}
