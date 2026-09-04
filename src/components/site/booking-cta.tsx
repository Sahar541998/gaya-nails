import Link from "next/link";

import type { Messages } from "@/i18n/messages";

type BookingCtaProps = {
  copy: Messages["cta"];
  bookHref: string;
};

export function BookingCta({ copy, bookHref }: BookingCtaProps) {
  return (
    <section className="border-y border-rose-line bg-blush/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-5 py-16 md:px-8 md:py-20">
        <h2 className="font-display text-3xl text-ink md:text-5xl">
          {copy.title}
        </h2>
        <p className="text-base text-ink/70">{copy.subtitle}</p>
        <Link href={bookHref} className="btn-primary">
          {copy.bookNow}
        </Link>
      </div>
    </section>
  );
}
