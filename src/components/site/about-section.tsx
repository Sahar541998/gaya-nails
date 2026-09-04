import Image from "next/image";

import { PLACEHOLDER_ABOUT } from "@/lib/public-media";
import { interpolate } from "@/i18n/interpolate";
import { labelTrackingClass, type Locale } from "@/i18n/locales";
import type { Messages } from "@/i18n/messages";

type AboutSectionProps = {
  studioName: string;
  locale: Locale;
  copy: Messages["about"];
  imageSrc?: string;
};

export function AboutSection({
  studioName,
  locale,
  copy,
  imageSrc = PLACEHOLDER_ABOUT,
}: AboutSectionProps) {
  return (
    <section
      id="about"
      className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-blush md:order-last">
        <Image
          src={imageSrc}
          alt={interpolate(copy.imageAlt, { studioName })}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="max-w-md">
        <h2
          className={`font-display text-3xl text-ink md:text-4xl ${labelTrackingClass(locale)}`}
        >
          {copy.title}
        </h2>
        <p className="mt-6 text-base leading-8 text-ink/75">
          {interpolate(copy.body, { studioName })}
        </p>
      </div>
    </section>
  );
}
