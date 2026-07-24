import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { StickyCTAButton } from "@/components/sticky-cta-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "tierisch-verliebt.de – Singles, Tierwelten & Magazin",
    template: "%s | tierisch-verliebt.de",
  },
  description:
    "Tierisch verliebte Singles, tierliebe Geschichten und ein Magazin für Hund, Katze und andere Haustiermenschen in einer warmen, vertrauensvollen Oberfläche.",
  metadataBase: new URL("https://tierisch-verliebt.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <StickyCTAButton />
      </body>
    </html>
  );
}
