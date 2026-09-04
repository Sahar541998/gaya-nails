import Image from "next/image";
import Link from "next/link";

import { PLACEHOLDER_HERO } from "@/lib/public-media";

type HeroProps = {
  imageSrc?: string;
  imageAlt?: string;
};

export function Hero({
  imageSrc = PLACEHOLDER_HERO,
  imageAlt = "Placeholder photograph of a manicure. Replace with studio work.",
}: HeroProps) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:gap-16 md:px-8 md:py-20">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-blush">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-6 md:max-w-md">
        <p className="text-xs tracking-[0.28em] text-ink/60 uppercase">
          Nail artist
        </p>
        <h1 className="font-display text-5xl leading-[1.05] text-ink md:text-6xl">
          Your nails,
          <br />
          your style.
        </h1>
        <p className="text-sm tracking-[0.18em] text-ink/70 uppercase">
          Gel · Builder · Nail art
        </p>
        <Link href="/book" className="btn-primary w-fit">
          Book now
        </Link>
      </div>
    </section>
  );
}
