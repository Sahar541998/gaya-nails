import Image from "next/image";

import { PLACEHOLDER_ABOUT } from "@/lib/public-media";

type AboutSectionProps = {
  studioName: string;
  imageSrc?: string;
};

export function AboutSection({
  studioName,
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
          alt={`Portrait placeholder for ${studioName}. Replace with a studio photo.`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="max-w-md">
        <h2 className="font-display text-3xl tracking-wide text-ink uppercase md:text-4xl">
          About
        </h2>
        <p className="mt-6 text-base leading-8 text-ink/75">
          {studioName} is a nail studio focused on clean shapes, lasting gel,
          and considered colour. Copy for this section will be replaced with
          Gaya’s own words.
        </p>
      </div>
    </section>
  );
}
