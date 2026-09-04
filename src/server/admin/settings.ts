import "server-only";

import { DateTime } from "luxon";
import { z } from "zod";

import { getDataAccess } from "@/da";
import { parseHm } from "@/lib/business-time";
import { validationError } from "@/lib/errors";
import { requireAdmin } from "@/server/auth/require-admin";
import type { BusinessSettings, DayHours, WeeklyHours } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

const dayKeys = ["0", "1", "2", "3", "4", "5", "6"] as const;

const settingsSchema = z.object({
  studioName: z.string().trim().min(1).max(80),
  locationLabel: z.string().trim().max(120),
  instagramUrl: z
    .string()
    .trim()
    .max(200)
    .refine(
      (value) =>
        value.length === 0 ||
        value.startsWith("https://") ||
        value.startsWith("http://"),
      "Enter a full Instagram URL, or leave it blank.",
    ),
  timezone: z.string().trim().min(1).max(80),
  bookingEnabled: z.boolean(),
});

export type WeeklyHoursInput = Record<
  (typeof dayKeys)[number],
  { open: boolean; openTime: string; closeTime: string }
>;

function parseWeeklyHours(input: WeeklyHoursInput): Result<WeeklyHours> {
  const weeklyHours: WeeklyHours = {};
  for (const key of dayKeys) {
    const day = input[key];
    if (!day.open) {
      continue;
    }
    const open = parseHm(day.openTime);
    const close = parseHm(day.closeTime);
    if (open === null || close === null) {
      return validationError("Enter valid opening and closing times.");
    }
    const openMinutes = open.hour * 60 + open.minute;
    const closeMinutes = close.hour * 60 + close.minute;
    if (closeMinutes <= openMinutes) {
      return validationError("Closing time must be after opening time.");
    }
    const hours: DayHours = { open: day.openTime, close: day.closeTime };
    weeklyHours[key] = hours;
  }
  return ok(weeklyHours);
}

export async function getAdminSettings(): Promise<Result<BusinessSettings>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  const settings = await getDataAccess().businessSettings.get();
  return ok(settings);
}

export async function updateAdminSettings(input: {
  studioName: string;
  locationLabel: string;
  instagramUrl: string;
  timezone: string;
  bookingEnabled: boolean;
  weeklyHours: WeeklyHoursInput;
}): Promise<Result<BusinessSettings>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return validationError(first ?? "Check the studio settings and try again.");
  }

  const zone = DateTime.now().setZone(parsed.data.timezone);
  if (!zone.isValid) {
    return validationError("Enter a valid timezone.");
  }

  const weeklyHours = parseWeeklyHours(input.weeklyHours);
  if (!weeklyHours.ok) {
    return weeklyHours;
  }

  const current = await getDataAccess().businessSettings.get();
  const updated = await getDataAccess().businessSettings.update({
    ...current,
    studioName: parsed.data.studioName,
    locationLabel: parsed.data.locationLabel,
    instagramUrl: parsed.data.instagramUrl,
    timezone: parsed.data.timezone,
    bookingEnabled: parsed.data.bookingEnabled,
    weeklyHours: weeklyHours.data,
  });
  return ok(updated);
}
