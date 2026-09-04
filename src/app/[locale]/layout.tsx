import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { LOCALES, isLocale, type Locale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import { withLocale } from "@/i18n/path";
import { getStudioSettings } from "@/server/site/get-studio";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale: Locale = localeParam;
  const copy = getMessages(locale);
  const studioResult = await getStudioSettings();
  const studio = studioResult.ok
    ? studioResult.data
    : { studioName: "Gaya", locationLabel: "", instagramUrl: "" };

  const navItems = [
    { href: withLocale(locale, "/"), label: copy.header.navHome },
    { href: `${withLocale(locale, "/")}#work`, label: copy.header.navWork },
    {
      href: `${withLocale(locale, "/")}#services`,
      label: copy.header.navServices,
    },
    { href: `${withLocale(locale, "/")}#about`, label: copy.header.navAbout },
  ];

  return (
    <>
      <a href="#main" className="skip-link">
        {copy.skipToContent}
      </a>
      <SiteHeader
        studioName={studio.studioName}
        locale={locale}
        copy={copy.header}
        navItems={navItems}
        bookHref={withLocale(locale, "/book")}
        homeHref={withLocale(locale, "/")}
      />
      {children}
      <SiteFooter
        studioName={studio.studioName}
        locationLabel={studio.locationLabel}
        instagramUrl={studio.instagramUrl}
        year={new Date().getFullYear()}
        locale={locale}
        copy={copy.footer}
        bookHref={withLocale(locale, "/book")}
      />
    </>
  );
}
