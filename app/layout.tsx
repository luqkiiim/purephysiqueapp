import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";

import "./globals.css";

const luloCleanDisplay = localFont({
  src: [
    { path: "./fonts/Lulo Clean One Bold.otf", weight: "400", style: "normal" },
    { path: "./fonts/Lulo Clean One Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pure Physique",
  description:
    "Mobile-first fitness and nutrition coaching check-ins for coaches and clients.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Pure Physique",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#181818",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={luloCleanDisplay.variable}>{children}</body>
    </html>
  );
}
