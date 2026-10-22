import { notFound } from "next/navigation";
import { isMarketCode, publicUrl } from "@/lib/markets";
import { NL_PILOT_INDEXABLE } from "@/lib/nl-routes";
export function generateStaticParams(){return[{market:"at"},{market:"ch"}];}
export async function GET(_request:Request,{params}:{params:Promise<{market:string}>}){const {market}=await params;if(!isMarketCode(market)||market==="de")notFound();return new Response(market==="nl"&&!NL_PILOT_INDEXABLE?"User-agent: *\nDisallow: /\n":`User-agent: *\nAllow: /\nSitemap: ${publicUrl(market,"/sitemap.xml")}\n`,{headers:{"content-type":"text/plain; charset=utf-8"}});}
