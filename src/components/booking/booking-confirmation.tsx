import Link from "next/link";

import { formatDurationMinutes, formatIlsFromCents } from "@/lib/money";

type BookingConfirmationProps = {
  serviceName: string;
  dateLabel: string;
  timeLabel: string;
  durationMinutes: number;
  priceCents: number;
};

export function BookingConfirmation({
  serviceName,
  dateLabel,
  timeLabel,
  durationMinutes,
  priceCents,
}: BookingConfirmationProps) {
  return (
    <section className="max-w-xl">
      <p className="text-xs tracking-[0.28em] text-ink/60 uppercase">
        Confirmed
      </p>
      <h1 className="font-display mt-3 text-4xl text-ink md:text-5xl">
        You’re booked.
      </h1>
      <p className="mt-4 text-base leading-7 text-ink/70">
        {`${serviceName} on ${dateLabel} at ${timeLabel}. ${formatDurationMinutes(durationMinutes)}, ${formatIlsFromCents(priceCents)}.`}
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back home
      </Link>
    </section>
  );
}
