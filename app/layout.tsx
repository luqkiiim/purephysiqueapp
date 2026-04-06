import type { Metadata } from "next";

import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
