import { formatDurationMinutes, formatIlsFromCents } from "@/lib/money";
import type { Service } from "@/types/domain";

type ServicesSectionProps = {
  services: readonly Service[];
};

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section
      id="services"
      className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24"
    >
      <h2 className="font-display text-3xl tracking-wide text-ink uppercase md:text-4xl">
        Services
      </h2>
      {services.length === 0 ? (
        <p className="mt-8 text-sm text-ink/65">
          Services will appear here once they are added.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-rose-line">
          {services.map((service) => (
            <li
              key={service.id}
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
                <p className="mt-1 text-xs tracking-wide text-ink/50 uppercase">
                  {formatDurationMinutes(service.durationMinutes)}
                </p>
              </div>
              <p className="hidden text-lg text-ink md:block">
                {formatIlsFromCents(service.priceCents)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
