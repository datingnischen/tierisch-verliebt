import { permanentRedirect } from "next/navigation";
import { ABOUT_REVIEWS_PATH } from "@/lib/about-section";

export default function LegacyReviewsRedirectPage() {
  permanentRedirect(ABOUT_REVIEWS_PATH);
}
