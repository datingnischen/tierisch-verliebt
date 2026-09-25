"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import type { MarketCode } from "@/lib/markets";
import { isPreviewHost, previewPath, publicUrl } from "@/lib/markets";
import Link from "@/components/link";

type Props = { market: MarketCode; path?: string; children: ReactNode; className?: string };

const noSubscribe = () => () => {};

/** true auf localhost und *.vercel.app – dort verlinken wir die Vorschau statt der Live-Domain. */
export function usePreviewHost() {
  return useSyncExternalStore(noSubscribe, () => isPreviewHost(window.location.hostname), () => false);
}

/**
 * Link auf eine Next.js-Seite. Im HTML steht die Live-URL (SEO, Landesdomains hinter nginx); auf
 * Vorschau-Hosts zeigt das href nach der Hydration auf den Vercel-Pfad (/ch/partnersuche/…), damit
 * Hover, neuer Tab und Klick auf der Vorschau bleiben.
 */
export function MarketLink({ market, path = "/", children, className }: Props) {
  const preview = usePreviewHost();
  if (preview) return <Link className={className} href={previewPath(market, path)}>{children}</Link>;
  return <a className={className} href={publicUrl(market, path)}>{children}</a>;
}
