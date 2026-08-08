import { permanentRedirect } from "next/navigation";
import { ABOUT_SOCIAL_MEDIA_PATH } from "@/lib/about-section";

export default function LegacySocialMediaRedirectPage() {
  permanentRedirect(ABOUT_SOCIAL_MEDIA_PATH);
}
