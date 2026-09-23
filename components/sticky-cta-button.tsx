'use client';

import { usePathname } from 'next/navigation';
import { publicUrl, type MarketCode } from '@/lib/markets';

export function StickyCTAButton({ market='de' }: { market?: MarketCode }) {
  const pathname=usePathname()||'/';
  const cityIntent=pathname.includes('/partnersuche')||pathname.includes('/kontakte');
  const text='Tierliebe Singles kennenlernen';
  const href=publicUrl(market,cityIntent?'/registration/?AID=location':'/?AID=magazin');
  return <a href={href} className="sticky-cta-button" aria-label={text}><span className="sticky-cta-text">{text}</span><span className="sticky-cta-icon" aria-hidden="true">→</span></a>;
}
