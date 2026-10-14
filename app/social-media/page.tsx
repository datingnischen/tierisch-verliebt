import { permanentRedirect } from "next/navigation";
import { ABOUT_SOCIAL_MEDIA_PATH } from "@/lib/about-section";
import { withTrailingSlash } from "@/lib/markets";

export default function LegacySocialMediaRedirectPage() {
  // Direkt auf die Slash-Variante, sonst folgt eine zweite Umleitung durch proxy.ts.
  permanentRedirect(withTrailingSlash(ABOUT_SOCIAL_MEDIA_PATH));
}
