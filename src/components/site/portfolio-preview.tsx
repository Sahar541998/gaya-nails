import Image from "next/image";
import Link from "next/link";

import type { GalleryItem } from "@/lib/public-media";

type PortfolioPreviewProps = {
  items: readonly GalleryItem[];
  isPlaceholder: boolean;
  showViewAll?: boolean;
  headingLevel?: "h1" | "h2";
};

export function PortfolioPreview({
  items,
  isPlaceholder,
  showViewAll = true,
  headingLevel = "h2",
}: PortfolioPreviewProps) {
  const Heading = headingLevel;
  return (
    <section
      id="work"
      className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24"
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <Heading className="font-display text-3xl tracking-wide text-ink uppercase md:text-4xl">
          My work
        </Heading>
        {showViewAll ? (
          <Link
            href="/work"
            className="text-sm tracking-[0.16em] text-ink/70 uppercase"
          >
            View all
          </Link>
        ) : null}
      </div>
      {isPlaceholder ? (
        <p className="mb-6 max-w-xl text-sm leading-6 text-ink/65">
          Preview images only. Real studio photos will replace these when the
          gallery is published.
        </p>
      ) : null}
      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-3">
        {items.slice(0, 6).map((item) => (
          <li key={item.src}>
            <a
              href={item.src}
              className="relative block aspect-square overflow-hidden bg-blush focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
