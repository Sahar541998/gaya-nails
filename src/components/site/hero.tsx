import Image from "next/image";
import Link from "next/link";

import { PLACEHOLDER_HERO } from "@/lib/public-media";
import { eyebrowClass, type Locale } from "@/i18n/locales";
import type { Messages } from "@/i18n/messages";

type HeroProps = {
  locale: Locale;
  copy: Messages["hero"];
  bookHref: string;
  imageSrc?: string;
};

export function Hero({
  locale,
  copy,
  bookHref,
  imageSrc = PLACEHOLDER_HERO,
}: HeroProps) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:gap-16 md:px-8 md:py-20">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-blush">
        <Image
          src={imageSrc}
          alt={copy.imageAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-6 md:max-w-md">
        <p className={`text-xs text-ink/60 ${eyebrowClass(locale)}`}>
          {copy.eyebrow}
        </p>
        <h1 className="font-display text-5xl leading-[1.05] text-ink md:text-6xl">
          {copy.titleLine1}
          <br />
          {copy.titleLine2}
        </h1>
        <p className={`text-sm text-ink/70 ${eyebrowClass(locale)}`}>
          {copy.servicesLine}
        </p>
        <Link href={bookHref} className="btn-primary w-fit">
          {copy.bookNow}
        </Link>
      </div>
    </section>
  );
}
