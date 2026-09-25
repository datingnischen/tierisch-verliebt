"use client";

import { useEffect } from "react";
import { isPreviewHost, previewPathForUrl } from "@/lib/markets";

type Props = { selector: string };

/**
 * Importiertes HTML verlinkt absolut auf die Live-Domain. Auf Vorschau-Hosts biegen wir Links auf
 * Next.js-Seiten (Stadtseiten, Magazin …) auf den Vercel-Pfad um; ICONY-Seiten bleiben live.
 */
export function PreviewLinkRewriter({ selector }: Props) {
  useEffect(() => {
    if (!isPreviewHost(window.location.hostname)) return;
    document.querySelectorAll(selector).forEach((root) => {
      root.querySelectorAll<HTMLAnchorElement>('a[href^="https://"]').forEach((anchor) => {
        const target = previewPathForUrl(anchor.href);
        if (target) anchor.setAttribute("href", target);
      });
    });
  }, [selector]);
  return null;
}
