import type { Metadata } from "next";

import { BookingFlow } from "@/components/booking/booking-flow";
import { getBookingPageData } from "@/server/booking/get-booking-page";

export const metadata: Metadata = {
  title: "Book",
  description: "Book a nail appointment with Gaya.",
};

export default async function BookPage() {
  const page = await getBookingPageData();
  const data = page.ok
    ? page.data
    : {
        bookingEnabled: false,
        services: [],
        openDates: [],
        timezone: "",
      };

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
        />
      )}
    </main>
  );
}
