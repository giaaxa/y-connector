import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Satisfy } from "next/font/google";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
/** Only used inside the temporary SVG logo recreation. */
const script = Satisfy({ variable: "--font-script", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Y Connector — Connecting the next generation of builders", template: "%s · Y Connector" },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: "Y Connector",
    title: "Y Connector — Connecting the next generation of builders",
    description: siteConfig.description,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#FFCC00",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} ${script.variable} antialiased`}>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-sun focus:px-4 focus:py-2 focus:font-semibold">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
