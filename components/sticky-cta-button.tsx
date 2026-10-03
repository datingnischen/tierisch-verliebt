'use client';

import { usePathname } from 'next/navigation';
import { publicUrl, type MarketCode } from '@/lib/markets';

export function StickyCTAButton({ market='de' }: { market?: MarketCode }) {
  const pathname=usePathname()||'/';
  const cityIntent=pathname.includes('/partnersuche')||pathname.includes('/kontakte');
  const text=market==='nl'?'Singles met hart voor dieren ontmoeten':'Tierliebe Singles kennenlernen';
  const href=market==='nl'?publicUrl(market,`/registration/?AID=${pathname.includes('/magazin')?'magazin':'location'}`):publicUrl(market,cityIntent?'/registration/?AID=location':'/?AID=magazin');
  return <a href={href} className="sticky-cta-button" aria-label={text}><span className="sticky-cta-text">{text}</span><span className="sticky-cta-icon" aria-hidden="true">→</span></a>;
}
