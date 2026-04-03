import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "Mythic Triad — A Roguelike Card Battler",
  description:
    "A browser-based card game combining Triple Triad tactics with roguelike progression. 20+ unique characters, 30+ abilities, and strategic deck building. Play free in your browser.",
  openGraph: {
    title: "Mythic Triad — A Roguelike Card Battler",
    description:
      "A browser-based card game combining Triple Triad tactics with roguelike progression. 20+ unique characters, 30+ abilities, and strategic deck building. Play free in your browser.",
    type: "website",
    siteName: "Mythic Triad",
    images: [
      {
        url: "/assets/dragon.png",
        width: 512,
        height: 512,
        alt: "Mythic Triad — Red Dragon card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mythic Triad — A Roguelike Card Battler",
    description:
      "A browser-based card game combining Triple Triad tactics with roguelike progression. Play free in your browser.",
    images: ["/assets/dragon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
