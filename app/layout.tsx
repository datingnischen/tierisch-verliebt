import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { StickyCTAButton } from "@/components/sticky-cta-button";
import { getMarket, isMarketCode, type MarketCode } from "@/lib/markets";

const geistSans=Geist({variable:"--font-geist-sans",subsets:["latin"]});
const geistMono=Geist_Mono({variable:"--font-geist-mono",subsets:["latin"]});
export const metadata:Metadata={title:{default:"tierisch-verliebt.de – Singles, Tierwelten & Magazin",template:"%s | tierisch-verliebt.de"},description:"Tierliebe Singles, regionale Partnersuche und ein Magazin für Menschen, bei denen Tiere zur Familie gehören.",metadataBase:new URL("https://tierisch-verliebt.de")};
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){const value=(await headers()).get("x-tv-market")||"de";const market:MarketCode=isMarketCode(value)?value:"de";return <html lang={getMarket(market).locale} className={`${geistSans.variable} ${geistMono.variable}`}><body><SiteHeader market={market}/>{children}<SiteFooter market={market}/><StickyCTAButton market={market}/></body></html>;}
