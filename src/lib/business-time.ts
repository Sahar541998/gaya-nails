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

function zonedDateFromInput(
  isoOrDate: string,
  timeZone: string,
): DateTime | null {
  const fromDate = parseLocalDate(isoOrDate, timeZone);
  const value =
    fromDate ??
    DateTime.fromISO(isoOrDate, { setZone: true }).setZone(timeZone);
  if (!value.isValid) {
    return null;
  }
  return value;
}

export function toDateTimeLocalInput(iso: string, timeZone: string): string {
  const value = DateTime.fromISO(iso, { setZone: true }).setZone(timeZone);
  if (!value.isValid) {
    return "";
  }
  return value.toFormat("yyyy-MM-dd'T'HH:mm");
}

export function formatDateLong(isoOrDate: string, timeZone: string): string {
  const value = zonedDateFromInput(isoOrDate, timeZone);
  if (value === null) {
    return isoOrDate;
  }
  return value.toFormat("ccc d LLL yyyy");
}

export type DateChipLabels = {
  weekdayLabel: string;
  dayLabel: string;
  monthLabel: string;
};

export function formatDateChip(
  isoOrDate: string,
  timeZone: string,
): DateChipLabels {
  const value = zonedDateFromInput(isoOrDate, timeZone);
  if (value === null) {
    return {
      weekdayLabel: isoOrDate,
      dayLabel: "",
      monthLabel: "",
    };
  }
  return {
    weekdayLabel: value.toFormat("ccc"),
    dayLabel: value.toFormat("d"),
    monthLabel: value.toFormat("LLL"),
  };
}

export type LocalCalendarDay = {
  date: string;
  bookable: boolean;
};

function isLocalDayBookable(
  day: DateTime,
  weeklyHours: WeeklyHours,
  timeZone: string,
  nowZoned: DateTime,
): boolean {
  const hours = weeklyHours[weekdayKey(day, timeZone)];
  if (hours === undefined) {
    return false;
  }
  const closeHm = parseHm(hours.close);
  if (closeHm === null) {
    return false;
  }
  const close = zonedDateTime(
    {
      year: day.year,
      month: day.month,
      day: day.day,
      hour: closeHm.hour,
      minute: closeHm.minute,
    },
    timeZone,
  );
  return close !== null && close > nowZoned;
}

export function listLocalDateWindow(
  weeklyHours: WeeklyHours,
  timeZone: string,
  now: Date,
  dayCount: number,
): readonly LocalCalendarDay[] {
  const nowZoned = DateTime.fromJSDate(now, { zone: timeZone });
  const start = nowZoned.startOf("day");
  const dates: LocalCalendarDay[] = [];
  for (let offset = 0; offset < dayCount; offset += 1) {
    const day = start.plus({ days: offset });
    dates.push({
      date: day.toFormat("yyyy-MM-dd"),
      bookable: isLocalDayBookable(day, weeklyHours, timeZone, nowZoned),
    });
  }
  return dates;
}

export function listOpenLocalDates(
  weeklyHours: WeeklyHours,
  timeZone: string,
  now: Date,
  dayCount: number,
): readonly string[] {
  return listLocalDateWindow(weeklyHours, timeZone, now, dayCount)
    .filter((day) => day.bookable)
    .map((day) => day.date);
}
