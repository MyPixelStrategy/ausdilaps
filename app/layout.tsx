import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ausdilaps.com.au"),
  title: {
    default: "AusDilaps — Tier 1 Dilapidation Specialists",
    template: "%s — AusDilaps",
  },
  description:
    "Australia's specialist dilapidation reporting firm — pre- and post-construction condition reports that hold up when a damage claim is made. Trusted on Queens Wharf, NorthConnex, Brisbane Airport and Barangaroo.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
