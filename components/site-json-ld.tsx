import { serializeJsonLd } from "@/lib/json-ld";
import { buildSiteGraph, type SiteGraphPage } from "@/lib/site-entities";
import { SOCIAL_CHANNELS } from "@/lib/social-channels";
import { SITE_URL } from "@/lib/wordpress";

export function SiteJsonLd({ page }: { page?: SiteGraphPage }) {
  const graph = buildSiteGraph({ siteUrl: SITE_URL, sameAs: SOCIAL_CHANNELS.map((channel) => channel.href), page });
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(graph) }} />;
}
