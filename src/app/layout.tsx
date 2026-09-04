import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Heebo } from "next/font/google";
import { headers } from "next/headers";

import { isLocale, localeDir, type Locale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";

import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  display: "swap",
});

function localeFromRequest(headerLocale: string | null): Locale {
  return isLocale(headerLocale) ? headerLocale : "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const locale = localeFromRequest(headerList.get("x-locale"));
  const copy = getMessages(locale);
  return {
    title: {
      default: copy.meta.titleDefault,
      template: copy.meta.titleTemplate,
    },
    description: copy.meta.description,
    openGraph: {
      title: copy.meta.titleDefault,
      description: copy.meta.description,
      type: "website",
      images: [
        {
          url: "/media/placeholders/hero.png",
          alt: copy.hero.imageAlt,
        },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const headerList = await headers();
  const locale = localeFromRequest(headerList.get("x-locale"));

  return (
    <html
      lang={locale}
      dir={localeDir(locale)}
      className={`${heebo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        {children}
      </body>
    </html>
  );
}
