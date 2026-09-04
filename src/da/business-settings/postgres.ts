import "server-only";

import type { BusinessSettingsStore } from "@/da/business-settings/business-settings";
import { getSql } from "@/da/postgres/client";
import { BUSINESS_TIME_ZONE, DEFAULT_WEEKLY_HOURS } from "@/lib/business-time";
import type { BusinessSettings, DayHours, WeeklyHours } from "@/types/domain";

type BusinessSettingsRow = {
  timezone: string;
  booking_enabled: boolean;
  slot_interval_minutes: number;
  weekly_hours: unknown;
  studio_name: string;
  location_label: string;
  instagram_url: string;
};

function isDayHours(value: unknown): value is DayHours {
  return (
    typeof value === "object" &&
    value !== null &&
    "open" in value &&
    "close" in value &&
    typeof value.open === "string" &&
    typeof value.close === "string"
  );
}

function parseWeeklyHours(value: unknown): WeeklyHours {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_WEEKLY_HOURS;
  }

  const next: WeeklyHours = {};
  const keys = ["0", "1", "2", "3", "4", "5", "6"] as const;
  for (const key of keys) {
    if (!Object.hasOwn(value, key)) {
      continue;
    }
    const hours: unknown = Reflect.get(value, key);
    if (isDayHours(hours)) {
      next[key] = hours;
    }
  }
  return next;
}

function mapBusinessSettings(row: BusinessSettingsRow): BusinessSettings {
  return {
    timezone: row.timezone.length > 0 ? row.timezone : BUSINESS_TIME_ZONE,
    bookingEnabled: row.booking_enabled,
    slotIntervalMinutes: row.slot_interval_minutes,
    weeklyHours: parseWeeklyHours(row.weekly_hours),
    studioName: row.studio_name.length > 0 ? row.studio_name : "Gaya",
    locationLabel: row.location_label,
    instagramUrl: row.instagram_url,
  };
}

export function createPostgresBusinessSettings(): BusinessSettingsStore {
  const sql = getSql();

  return {
    async get() {
      const rows = await sql<BusinessSettingsRow[]>`
        select
          timezone, booking_enabled, slot_interval_minutes, weekly_hours,
          studio_name, location_label, instagram_url
        from public.business_settings
        where id = true
        limit 1
      `;
      const row = rows[0];
      if (row === undefined) {
        return {
          timezone: BUSINESS_TIME_ZONE,
          bookingEnabled: true,
          slotIntervalMinutes: 30,
          weeklyHours: DEFAULT_WEEKLY_HOURS,
          studioName: "Gaya",
          locationLabel: "",
          instagramUrl: "",
        };
      }
      return mapBusinessSettings(row);
    },

    async update(settings) {
      const rows = await sql<BusinessSettingsRow[]>`
        update public.business_settings
        set
          timezone = ${settings.timezone},
          booking_enabled = ${settings.bookingEnabled},
          slot_interval_minutes = ${settings.slotIntervalMinutes},
          weekly_hours = ${sql.json(settings.weeklyHours)},
          studio_name = ${settings.studioName},
          location_label = ${settings.locationLabel},
          instagram_url = ${settings.instagramUrl},
          updated_at = now()
        where id = true
        returning
          timezone, booking_enabled, slot_interval_minutes, weekly_hours,
          studio_name, location_label, instagram_url
      `;
      const row = rows[0];
      if (row === undefined) {
        throw new Error("Failed to update business settings.");
      }
      return mapBusinessSettings(row);
    },
  };
}
