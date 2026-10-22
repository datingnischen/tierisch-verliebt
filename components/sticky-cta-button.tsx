'use client';

import { usePathname } from 'next/navigation';
import { publicUrl, type MarketCode } from '@/lib/markets';
import { IT_PLATFORM } from '@/lib/it-routes';
import { nlRegistrationUrl } from '@/lib/nl-routes';

export function StickyCTAButton({ market='de' }: { market?: MarketCode }) {
  const pathname=usePathname()||'/';
  if(market==='it')return <a href={IT_PLATFORM.registrationUrl} className="sticky-cta-button" aria-label="Conosci single che amano gli animali"><span className="sticky-cta-text">Conosci single che amano gli animali</span><span className="sticky-cta-icon" aria-hidden="true">→</span></a>;
  const cityIntent=pathname.includes('/partnersuche')||pathname.includes('/kontakte');
  const text=market==='nl'?'Singles met hart voor dieren ontmoeten':cityIntent?'Tierliebe Singles in deiner Nähe':'Tierliebe Singles kennenlernen';
  const href=market==='nl'?nlRegistrationUrl(pathname.includes('/magazin')?'magazin':'location'):publicUrl(market,cityIntent?'/registration/?AID=location':'/?AID=magazin');
  return <a href={href} className="sticky-cta-button" aria-label={text}><span className="sticky-cta-text">{text}</span><span className="sticky-cta-icon" aria-hidden="true">→</span></a>;
}
