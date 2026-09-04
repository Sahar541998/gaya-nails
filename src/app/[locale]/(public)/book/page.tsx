import type { Metadata } from "next";

import { BookingFlow } from "@/components/booking/booking-flow";
import { getBookingPageData } from "@/server/booking/get-booking-page";
import { getBookingSlots } from "@/server/booking/get-booking-slots";

export const metadata: Metadata = {
  title: "Book",
  description: "Book a nail appointment with Gaya.",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const page = await getBookingPageData();
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
        initialSlotsMessage =
          "No times are open on this day. Try another date.";
      }
    } else {
      initialSlotsMessage = slots.error.message;
    }
  }

  return (
    <main id="main">
      {!data.bookingEnabled ? (
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
          <h1 className="font-display text-4xl text-ink">Book</h1>
          <p className="mt-4 max-w-xl text-base text-ink/70">
            Booking is not available right now.
          </p>
        </div>
      ) : data.services.length === 0 ? (
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
          <h1 className="font-display text-4xl text-ink">Book</h1>
          <p className="mt-4 max-w-xl text-base text-ink/70">
            Services will appear here once they are added.
          </p>
        </div>
      ) : (
        <BookingFlow
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
