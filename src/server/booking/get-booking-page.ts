import "server-only";

import { formatDateLong, listOpenLocalDates } from "@/lib/business-time";
import { getDataAccess } from "@/da";
import { listServices } from "@/server/services/services";
import type { Service } from "@/types/domain";
import { ok, type Result } from "@/types/result";

export type BookableDate = {
  date: string;
  label: string;
};

export type BookingPageData = {
  timezone: string;
  bookingEnabled: boolean;
  services: readonly Service[];
  openDates: readonly BookableDate[];
};

export async function getBookingPageData(
  now = new Date(),
): Promise<Result<BookingPageData>> {
  const [settings, servicesResult] = await Promise.all([
    getDataAccess().businessSettings.get(),
    listServices(),
  ]);

  const services = servicesResult.ok ? servicesResult.data : [];
  const dates = listOpenLocalDates(
    settings.weeklyHours,
    settings.timezone,
    now,
    28,
  );

  return ok({
    timezone: settings.timezone,
    bookingEnabled: settings.bookingEnabled,
    services,
    openDates: dates.map((date) => ({
      date,
      label: formatDateLong(date, settings.timezone),
    })),
  });
}
