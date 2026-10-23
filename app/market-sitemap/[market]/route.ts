import { notFound } from "next/navigation";
import { getMarketCityPages } from "@/lib/market-partnersuche";
import { isMarketCode, publicUrl } from "@/lib/markets";
import { IT_PILOT_INDEXABLE } from "@/lib/it-routes";
import { nlSitemapPaths } from "@/lib/nl-routes";
import { getChArticles } from "@/lib/ch-magazine";
export function generateStaticParams(){return[{market:"at"},{market:"ch"}];}
export async function GET(_request:Request,{params}:{params:Promise<{market:string}>}){const {market}=await params;if(!isMarketCode(market)||market==="de"||market==="it")notFound();const urls=market==="nl"?nlSitemapPaths(getMarketCityPages("nl").map(page=>page.slug)).map(path=>publicUrl("nl",path)):[publicUrl(market),publicUrl(market,"/partnersuche"),publicUrl(market,"/faq"),...getMarketCityPages(market).map(page=>publicUrl(market,page.path))];
  if(market==="ch")urls.push(publicUrl("ch","/magazin"),...getChArticles().map(article=>publicUrl("ch",`/magazin/${article.slug}`)));
  // Italienische Variante liegt auf tierisch-verliebt.ch/it/ und kommt erst nach Freigabe in die Schweizer Sitemap.
  if(market==="ch"&&IT_PILOT_INDEXABLE)urls.push(publicUrl("it"),...getMarketCityPages("it").map(page=>publicUrl("it",page.path)));const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`;return new Response(xml,{headers:{"content-type":"application/xml; charset=utf-8"}});}
