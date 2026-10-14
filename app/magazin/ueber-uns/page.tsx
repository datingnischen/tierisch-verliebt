import { permanentRedirect } from "next/navigation";
import { ABOUT_STORY_PATH } from "@/lib/about-section";
import { withTrailingSlash } from "@/lib/markets";

export default function LegacyAboutMagazineRedirectPage() {
  // Direkt auf die Slash-Variante, sonst folgt eine zweite Umleitung durch proxy.ts.
  permanentRedirect(withTrailingSlash(ABOUT_STORY_PATH));
}
