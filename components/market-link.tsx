"use client";

import type { MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { MarketCode } from "@/lib/markets";
import { publicUrl } from "@/lib/markets";

type Props = { market: MarketCode; path?: string; children: ReactNode; className?: string };

export function MarketLink({ market, path = "/", children, className }: Props) {
  const router = useRouter();
  const href = publicUrl(market, path);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".vercel.app")) {
      event.preventDefault();
      const normalized = path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
      router.push(`/${market}${normalized}`);
    }
  }

  return <a className={className} href={href} onClick={handleClick}>{children}</a>;
}
