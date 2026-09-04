import { AboutSection } from "@/components/site/about-section";
import { BookingCta } from "@/components/site/booking-cta";
import { Hero } from "@/components/site/hero";
import { PortfolioPreview } from "@/components/site/portfolio-preview";
import { ServicesSection } from "@/components/site/services-section";
import { galleryFromPortfolio } from "@/lib/public-media";
import { getHomePageData } from "@/server/site/get-home-page";

export default async function HomePage() {
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
      <Hero />
      <PortfolioPreview
        items={data.gallery}
        isPlaceholder={data.galleryIsPlaceholder}
      />
      <ServicesSection services={data.services} />
      <AboutSection studioName={data.studio.studioName} />
      <BookingCta />
    </main>
  );
}
