import { notFound } from "next/navigation";

import { AboutSection } from "@/components/site/about-section";
import { BookingCta } from "@/components/site/booking-cta";
import { Hero } from "@/components/site/hero";
import { PortfolioPreview } from "@/components/site/portfolio-preview";
import { ServicesSection } from "@/components/site/services-section";
import { isLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import { withLocale } from "@/i18n/path";
import { galleryFromPortfolio } from "@/lib/public-media";
import { getHomePageData } from "@/server/site/get-home-page";

export default async function HomePage({
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
        studio: { studioName: "Gaya", locationLabel: "", instagramUrl: "" },
        services: [],
        gallery: galleryFromPortfolio([]),
        galleryIsPlaceholder: true,
      };

  return (
    <main id="main">
      <Hero
        locale={locale}
        copy={copy.hero}
        bookHref={withLocale(locale, "/book")}
      />
      <PortfolioPreview
        items={data.gallery}
        isPlaceholder={data.galleryIsPlaceholder}
        locale={locale}
        copy={copy.work}
        workHref={withLocale(locale, "/work")}
      />
      <ServicesSection
        services={data.services}
        locale={locale}
        copy={copy.services}
        bookHref={withLocale(locale, "/book")}
      />
      <AboutSection
        studioName={data.studio.studioName}
        locale={locale}
        copy={copy.about}
      />
      <BookingCta copy={copy.cta} bookHref={withLocale(locale, "/book")} />
    </main>
  );
}
