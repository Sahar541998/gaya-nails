import type { PortfolioImage } from "@/types/domain";

export const PLACEHOLDER_HERO = "/media/placeholders/hero.png";
export const PLACEHOLDER_ABOUT = "/media/placeholders/about.png";

export type GalleryItem = {
  src: string;
  alt: string;
  isPlaceholder: boolean;
};

const PLACEHOLDER_WORK: readonly GalleryItem[] = [
  {
    src: "/media/placeholders/work-1.png",
    alt: "Placeholder photograph of nails. Studio work will appear here.",
    isPlaceholder: true,
  },
  {
    src: "/media/placeholders/work-2.png",
    alt: "Placeholder photograph of nails. Studio work will appear here.",
    isPlaceholder: true,
  },
  {
    src: "/media/placeholders/work-3.png",
    alt: "Placeholder photograph of nails. Studio work will appear here.",
    isPlaceholder: true,
  },
  {
    src: "/media/placeholders/work-4.png",
    alt: "Placeholder photograph of nails. Studio work will appear here.",
    isPlaceholder: true,
  },
  {
    src: "/media/placeholders/work-5.png",
    alt: "Placeholder photograph of nails. Studio work will appear here.",
    isPlaceholder: true,
  },
  {
    src: "/media/placeholders/work-6.png",
    alt: "Placeholder photograph of nails. Studio work will appear here.",
    isPlaceholder: true,
  },
];

export function publicMediaSrc(storagePath: string): string {
  if (
    storagePath.startsWith("/") ||
    storagePath.startsWith("http://") ||
    storagePath.startsWith("https://")
  ) {
    return storagePath;
  }
  return `/media/placeholders/${storagePath}`;
}

export function galleryFromPortfolio(
  images: readonly PortfolioImage[],
): readonly GalleryItem[] {
  if (images.length === 0) {
    return PLACEHOLDER_WORK;
  }

  return images.map((image) => ({
    src: publicMediaSrc(image.storagePath),
    alt:
      image.altText.length > 0 ? image.altText : "Nail work from Gaya’s studio",
    isPlaceholder: false,
  }));
}
