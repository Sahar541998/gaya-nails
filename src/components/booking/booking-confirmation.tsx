import Link from "next/link";

import { interpolate } from "@/i18n/interpolate";
import { eyebrowClass, type Locale } from "@/i18n/locales";
import type { Messages } from "@/i18n/messages";
import { formatDurationMinutes, formatIlsFromCents } from "@/lib/money";

type BookingConfirmationProps = {
  locale: Locale;
  copy: Messages["book"];
  homeHref: string;
  serviceName: string;
  dateLabel: string;
  timeLabel: string;
  durationMinutes: number;
  priceCents: number;
};

export function BookingConfirmation({
  locale,
  copy,
  homeHref,
  serviceName,
  dateLabel,
  timeLabel,
  durationMinutes,
  priceCents,
}: BookingConfirmationProps) {
  return (
    <section className="max-w-xl">
      <p className={`text-xs text-ink/60 ${eyebrowClass(locale)}`}>
        {copy.confirmedEyebrow}
      </p>
      <h1 className="font-display mt-3 text-4xl text-ink md:text-5xl">
        {copy.confirmedTitle}
      </h1>
      <p className="mt-4 text-base leading-7 text-ink/70">
        {interpolate(copy.confirmedSummary, {
          serviceName,
          date: dateLabel,
          time: timeLabel,
          duration: formatDurationMinutes(durationMinutes, locale),
          price: formatIlsFromCents(priceCents),
        })}
      </p>
      <Link href={homeHref} className="btn-primary mt-8">
        {copy.backHome}
      </Link>
    </section>
  );
}
