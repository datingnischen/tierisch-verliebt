import { notFound } from "next/navigation";
import { getMarketCityPages } from "@/lib/market-partnersuche";
import { isMarketCode, publicUrl } from "@/lib/markets";
export function generateStaticParams(){return[{market:"at"},{market:"ch"}];}
export async function GET(_request:Request,{params}:{params:Promise<{market:string}>}){const {market}=await params;if(!isMarketCode(market)||market==="de")notFound();const urls=[publicUrl(market),publicUrl(market,"/partnersuche"),...getMarketCityPages(market).map(page=>publicUrl(market,page.path))];const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`;return new Response(xml,{headers:{"content-type":"application/xml; charset=utf-8"}});}
