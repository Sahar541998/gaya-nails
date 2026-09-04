import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Gaya — Nail artist",
    template: "%s · Gaya",
  },
  description:
    "Nail artist studio. Gel, builder gel, and nail art. Book your next set.",
  openGraph: {
    title: "Gaya — Nail artist",
    description:
      "Nail artist studio. Gel, builder gel, and nail art. Book your next set.",
    type: "website",
    images: [
      {
        url: "/media/placeholders/hero.png",
        alt: "Placeholder photograph of a manicure",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        {children}
      </body>
    </html>
  );
}
