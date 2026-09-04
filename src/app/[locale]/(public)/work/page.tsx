import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PortfolioPreview } from "@/components/site/portfolio-preview";
import { isLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import { withLocale } from "@/i18n/path";
import { galleryFromPortfolio } from "@/lib/public-media";
import { getHomePageData } from "@/server/site/get-home-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    return {};
  }
  return { title: getMessages(localeParam).work.metaTitle };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam;
  const copy = getMessages(locale);
  const page = await getHomePageData();
  const data = page.ok
    ? page.data
    : {
        gallery: galleryFromPortfolio([]),
        galleryIsPlaceholder: true,
      };

  return (
    <main id="main">
      <PortfolioPreview
        items={data.gallery}
        isPlaceholder={data.galleryIsPlaceholder}
        locale={locale}
        copy={copy.work}
        workHref={withLocale(locale, "/work")}
        showViewAll={false}
        headingLevel="h1"
      />
    </main>
  );
}
