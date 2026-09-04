import type { Metadata } from "next";

import { PortfolioPreview } from "@/components/site/portfolio-preview";
import { galleryFromPortfolio } from "@/lib/public-media";
import { getHomePageData } from "@/server/site/get-home-page";

export const metadata: Metadata = {
  title: "My work",
};

export default async function WorkPage() {
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
        showViewAll={false}
        headingLevel="h1"
      />
    </main>
  );
}
