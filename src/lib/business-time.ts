import { DateTime, Settings } from "luxon";

import type { DayHours, WeeklyHours } from "@/types/domain";

Settings.defaultLocale = "en-GB";

export const BUSINESS_TIME_ZONE = "Asia/Jerusalem";

export const DEFAULT_WEEKLY_HOURS: WeeklyHours = {
  "0": { open: "09:00", close: "18:00" },
  "1": { open: "09:00", close: "18:00" },
  "2": { open: "09:00", close: "18:00" },
  "3": { open: "09:00", close: "18:00" },
  "4": { open: "09:00", close: "18:00" },
  "5": { open: "09:00", close: "14:00" },
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function toUtcIso(dateTime: DateTime): string {
  const iso = dateTime.toUTC().toISO();
  if (iso === null) {
    throw new Error("Invalid datetime.");
  }
  return iso;
}

export function parseInstant(value: string, timeZone: string): DateTime | null {
  const withZone = DateTime.fromISO(value, { setZone: true });
  if (
    withZone.isValid &&
    value.includes("T") &&
    /Z|[+-]\d{2}:?\d{2}$/.test(value)
  ) {
    return withZone.toUTC();
  }

  const local = DateTime.fromISO(value, { zone: timeZone });
  if (!local.isValid) {
    return null;
  }
  return local.toUTC();
}

export function weekdayKey(
  dateTime: DateTime,
  timeZone: string,
): keyof WeeklyHours {
  const local = dateTime.setZone(timeZone);
  const days = ["0", "1", "2", "3", "4", "5", "6"] as const;
  const jsDay = local.weekday === 7 ? 0 : local.weekday;
  const key = days[jsDay];
  if (key === undefined) {
    return "0";
  }
  return key;
}

export function dayHoursFor(
  dateTime: DateTime,
  timeZone: string,
  weeklyHours: WeeklyHours,
): DayHours | undefined {
  return weeklyHours[weekdayKey(dateTime, timeZone)];
}

export function localDateParts(
  dateTime: DateTime,
  timeZone: string,
): { year: number; month: number; day: number } {
  const local = dateTime.setZone(timeZone);
  return { year: local.year, month: local.month, day: local.day };
}

export function zonedDateTime(
  parts: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  },
  timeZone: string,
): DateTime | null {
  const local = DateTime.fromObject(parts, { zone: timeZone });
  if (!local.isValid) {
    return null;
  }
  return local;
}

export function parseHm(
  value: string,
): { hour: number; minute: number } | null {
  const match = TIME_PATTERN.exec(value);
  if (match === null || match[1] === undefined || match[2] === undefined) {
    return null;
  }
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export function addMinutes(iso: string, minutes: number): string {
  const start = DateTime.fromISO(iso, { setZone: true });
  if (!start.isValid) {
    throw new Error("Invalid start time.");
  }
  return toUtcIso(start.plus({ minutes }));
}

export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && endA > startB;
}

export function parseLocalDate(
  date: string,
  timeZone: string,
): DateTime | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (
    match === null ||
    match[1] === undefined ||
    match[2] === undefined ||
    match[3] === undefined
  ) {
    return null;
  }
  const local = DateTime.fromObject(
    {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
      hour: 0,
      minute: 0,
    },
    { zone: timeZone },
  );
  if (!local.isValid) {
    return null;
  }
  return local;
}

export function formatTimeHm(iso: string, timeZone: string): string {
  const value = DateTime.fromISO(iso, { setZone: true }).setZone(timeZone);
  if (!value.isValid) {
    return iso;
  }
  return value.toFormat("HH:mm");
}

export function formatDateLong(isoOrDate: string, timeZone: string): string {
  const fromDate = parseLocalDate(isoOrDate, timeZone);
  const value =
    fromDate ??
    DateTime.fromISO(isoOrDate, { setZone: true }).setZone(timeZone);
  if (!value.isValid) {
    return isoOrDate;
  }
  return value.toFormat("ccc d LLL yyyy");
}

export function listOpenLocalDates(
  weeklyHours: WeeklyHours,
  timeZone: string,
  now: Date,
  dayCount: number,
): readonly string[] {
  const start = DateTime.fromJSDate(now, { zone: timeZone }).startOf("day");
  const dates: string[] = [];
  for (let offset = 0; offset < dayCount; offset += 1) {
    const day = start.plus({ days: offset });
    if (weeklyHours[weekdayKey(day, timeZone)] === undefined) {
      continue;
    }
    dates.push(day.toFormat("yyyy-MM-dd"));
  }
  return dates;
}
