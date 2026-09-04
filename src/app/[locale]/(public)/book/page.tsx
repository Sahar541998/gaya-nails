import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingFlow } from "@/components/booking/booking-flow";
import { isLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";
import { withLocale } from "@/i18n/path";
import { getBookingPageData } from "@/server/booking/get-booking-page";
import { getBookingSlots } from "@/server/booking/get-booking-slots";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    return {};
  }
  const copy = getMessages(localeParam);
  return {
    title: copy.book.metaTitle,
    description: copy.book.metaDescription,
  };
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam;
  const copy = getMessages(locale);
  const page = await getBookingPageData(locale);
  const query = await searchParams;
  const requested =
    typeof query.service === "string" ? query.service : undefined;
  const data = page.ok
    ? page.data
    : {
        bookingEnabled: false,
        services: [],
        openDates: [],
        timezone: "",
      };
  const initialServiceId = data.services.some((item) => item.id === requested)
    ? requested
    : undefined;
  const firstDate = data.openDates.find((item) => item.bookable);
  let initialDate: string | undefined;
  let initialSlots: readonly {
    startsAt: string;
    endsAt: string;
    timeLabel: string;
  }[] = [];
  let initialSlotsMessage = "";

  if (initialServiceId !== undefined && firstDate !== undefined) {
    initialDate = firstDate.date;
    const slots = await getBookingSlots({
      serviceId: initialServiceId,
      date: firstDate.date,
    });
    if (slots.ok) {
      initialSlots = slots.data;
      if (slots.data.length === 0) {
        initialSlotsMessage = copy.book.noTimes;
      }
    } else {
      initialSlotsMessage = copy.book.errors.generic;
    }
  }

  return (
    <main id="main">
      {!data.bookingEnabled ? (
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
          <h1 className="font-display text-4xl text-ink">{copy.book.title}</h1>
          <p className="mt-4 max-w-xl text-base text-ink/70">
            {copy.book.unavailable}
          </p>
        </div>
      ) : data.services.length === 0 ? (
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
          <h1 className="font-display text-4xl text-ink">{copy.book.title}</h1>
          <p className="mt-4 max-w-xl text-base text-ink/70">
            {copy.book.noServices}
          </p>
        </div>
      ) : (
        <BookingFlow
          locale={locale}
          copy={copy.book}
          homeHref={withLocale(locale, "/")}
          services={data.services}
          openDates={data.openDates}
          timezone={data.timezone}
          initialSlots={initialSlots}
          initialSlotsMessage={initialSlotsMessage}
          {...(initialServiceId === undefined ? {} : { initialServiceId })}
          {...(initialDate === undefined ? {} : { initialDate })}
        />
      )}
    </main>
  );
}
