import "server-only";

import { getDataAccess } from "@/da";
import { galleryFromPortfolio, type GalleryItem } from "@/lib/public-media";
import { listPortfolioImages } from "@/server/portfolio/portfolio";
import { listServices } from "@/server/services/services";
import type { BusinessSettings, Service } from "@/types/domain";
import { ok, type Result } from "@/types/result";

export type HomePageData = {
  studio: Pick<
    BusinessSettings,
    "studioName" | "locationLabel" | "instagramUrl"
  >;
  services: readonly Service[];
  gallery: readonly GalleryItem[];
  galleryIsPlaceholder: boolean;
};

export async function getHomePageData(): Promise<Result<HomePageData>> {
  const [settings, servicesResult, imagesResult] = await Promise.all([
    getDataAccess().businessSettings.get(),
    listServices(),
    listPortfolioImages(),
  ]);

  const services = servicesResult.ok ? servicesResult.data : [];
  const images = imagesResult.ok ? imagesResult.data : [];
  const gallery = galleryFromPortfolio(images);

  return ok({
    studio: {
      studioName: settings.studioName,
      locationLabel: settings.locationLabel,
      instagramUrl: settings.instagramUrl,
    },
    services,
    gallery,
    galleryIsPlaceholder: images.length === 0,
  });
}
