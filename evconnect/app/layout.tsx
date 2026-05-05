import type { Metadata } from "next";
import { Syne, DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EVConnect — Find. Charge. Go.",
  description:
    "India's first peer-to-peer EV charging network. Find home chargers near you, plan your route, and never run out of battery.",
  keywords: [
    "EV charging",
    "electric vehicle",
    "P2P charger",
    "India",
    "Tata Nexon",
    "route planner",
    "battery predictor",
  ],
  authors: [{ name: "EVConnect Team" }],
  openGraph: {
    title: "EVConnect — Find. Charge. Go.",
    description:
      "India's first peer-to-peer EV charging network. Find home chargers near you, plan your route, and never run out of battery.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${syne.variable} ${dmSans.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#00FF88" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col"><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
