import type { Metadata, Viewport } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://templeora.vercel.app"),
  title: {
    default: "Devyatra / Templeora — Discover India's Temples",
    template: "%s · Devyatra",
  },
  description:
    "An AI-powered India temple & pilgrimage explorer. Verified timings, booking info, festivals, nearby places and personalized itineraries — Discover. Experience. Remember.",
  keywords: [
    "temples of India",
    "pilgrimage",
    "darshan timings",
    "temple festivals",
    "devyatra",
  ],
  openGraph: {
    type: "website",
    siteName: "Devyatra",
    title: "Devyatra — Discover India's Temples",
    description:
      "Explore sacred India with verified temple information and an AI companion.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devyatra",
    description: "Discover. Experience. Remember.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d0b09" },
    { media: "(prefers-color-scheme: light)", color: "#f6f1e7" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${fraunces.variable} dark`}>
      <body className="min-h-screen bg-obsidian text-ivory">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}