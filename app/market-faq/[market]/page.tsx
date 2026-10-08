import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqPage, faqMetadata } from "@/components/faq/faq-page";
import { isFaqMarket, type FaqMarket } from "@/lib/faq";

type Props = { params: Promise<{ market: string }> };

function active(value: string): FaqMarket {
  if (!isFaqMarket(value) || value === "de") notFound();
  return value;
}

export function generateStaticParams() {
  return [{ market: "at" }, { market: "ch" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return faqMetadata(active((await params).market));
}

export default async function MarketFaq({ params }: Props) {
  return <FaqPage market={active((await params).market)} />;
}
