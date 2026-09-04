import Link from "next/link";

import { formatDurationMinutes, formatIlsFromCents } from "@/lib/money";
import { labelTrackingClass, type Locale } from "@/i18n/locales";
import type { Messages } from "@/i18n/messages";
import type { Service } from "@/types/domain";

type ServicesSectionProps = {
  services: readonly Service[];
  locale: Locale;
  copy: Messages["services"];
  bookHref: string;
};

export function ServicesSection({
  services,
  locale,
  copy,
  bookHref,
}: ServicesSectionProps) {
  return (
    <section
      id="services"
      className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24"
    >
      <h2
        className={`font-display text-3xl text-ink md:text-4xl ${labelTrackingClass(locale)}`}
      >
        {copy.title}
      </h2>
      {services.length === 0 ? (
        <p className="mt-8 text-sm text-ink/65">{copy.empty}</p>
      ) : (
        <ul className="mt-10 divide-y divide-rose-line">
          {services.map((service) => (
            <li key={service.id}>
              <Link
                href={`${bookHref}?service=${service.id}`}
                className="grid grid-cols-1 gap-2 py-6 md:grid-cols-[1fr_auto] md:items-baseline"
              >
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-3 md:block">
                    <h3 className="text-lg text-ink">{service.name}</h3>
                    <p className="text-lg text-ink md:hidden">
                      {formatIlsFromCents(service.priceCents)}
                    </p>
                  </div>
                  {service.shortDescription.length > 0 ? (
                    <p className="mt-1 text-sm leading-6 text-ink/65">
                      {service.shortDescription}
                    </p>
                  ) : null}
                  <p
                    className={`mt-1 text-xs text-ink/50 ${labelTrackingClass(locale)}`}
                  >
                    {formatDurationMinutes(service.durationMinutes, locale)}
                  </p>
                </div>
                <p className="hidden text-lg text-ink md:block">
                  {formatIlsFromCents(service.priceCents)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
