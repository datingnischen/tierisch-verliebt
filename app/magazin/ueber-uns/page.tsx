import { permanentRedirect } from "next/navigation";
import { ABOUT_STORY_PATH } from "@/lib/about-section";

export default function LegacyAboutMagazineRedirectPage() {
  permanentRedirect(ABOUT_STORY_PATH);
}
