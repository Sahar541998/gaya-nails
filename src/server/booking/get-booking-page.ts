import "server-only";

import { localeBcp47, type Locale } from "@/i18n/locales";
import {
  formatDateChip,
  formatDateLong,
  listLocalDateWindow,
} from "@/lib/business-time";
import { getDataAccess } from "@/da";
import { listServices } from "@/server/services/services";
import type { Service } from "@/types/domain";
import { ok, type Result } from "@/types/result";

export type BookableDate = {
  date: string;
  label: string;
  weekdayLabel: string;
  dayLabel: string;
  monthLabel: string;
  bookable: boolean;
};

export type BookingPageData = {
  timezone: string;
  bookingEnabled: boolean;
  services: readonly Service[];
  openDates: readonly BookableDate[];
};

export async function getBookingPageData(
  locale: Locale = "en",
  now = new Date(),
): Promise<Result<BookingPageData>> {
  const [settings, servicesResult] = await Promise.all([
    getDataAccess().businessSettings.get(),
    listServices(),
  ]);

  const services = servicesResult.ok ? servicesResult.data : [];
  const dates = listLocalDateWindow(
    settings.weeklyHours,
    settings.timezone,
    now,
    28,
  );
  const bcp47 = localeBcp47(locale);

  return ok({
    timezone: settings.timezone,
    bookingEnabled: settings.bookingEnabled,
    services,
    openDates: dates.map((day) => ({
      date: day.date,
      label: formatDateLong(day.date, settings.timezone, bcp47),
      ...formatDateChip(day.date, settings.timezone, bcp47),
      bookable: day.bookable,
    })),
  });
}
