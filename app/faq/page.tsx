import { FaqPage, faqMetadata } from "@/components/faq/faq-page";

export const metadata = faqMetadata("de");

export default function Page() {
  return <FaqPage market="de" />;
}
