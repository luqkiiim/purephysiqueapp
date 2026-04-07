import localFont from "next/font/local";
import type { Metadata } from "next";

import "./globals.css";

const luloCleanDisplay = localFont({
  src: [
    { path: "./fonts/Lulo Clean One.otf", weight: "400", style: "normal" },
    { path: "./fonts/Lulo Clean One Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pure Physique",
  description:
    "Mobile-first fitness and nutrition coaching check-ins for coaches and clients.",
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
