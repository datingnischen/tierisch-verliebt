"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import type { VercelAnalyticsEndpoints } from "@/lib/vercel-analytics";
import { nlAnalyticsUrl } from "@/lib/nl-routes";

// Vercel Web Analytics mit /nl-Präfix für Aufrufe auf tierisch-verliebt.nl (siehe nlAnalyticsUrl).

function beforeSend(event: BeforeSendEvent): BeforeSendEvent {
  return { ...event, url: nlAnalyticsUrl(event.url) };
}

export function SiteAnalytics(props: VercelAnalyticsEndpoints) {
  return <Analytics {...props} beforeSend={beforeSend} />;
}
