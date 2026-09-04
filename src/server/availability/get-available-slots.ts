import "server-only";

import { z } from "zod";

import { getDataAccess } from "@/da";
import {
  parseHm,
  parseLocalDate,
  rangesOverlap,
  toUtcIso,
  weekdayKey,
  zonedDateTime,
} from "@/lib/business-time";
import { domainError, validationError } from "@/lib/errors";
import {
  endsAtFromDuration,
  loadActiveService,
} from "@/server/appointments/schedule";
import type { ServiceId } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

const inputSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type AvailableSlot = {
  startsAt: string;
  endsAt: string;
};

export type GetAvailableSlotsInput = {
  serviceId: ServiceId;
  date: string;
  now?: Date;
};

export async function getAvailableSlots(
  input: GetAvailableSlotsInput,
): Promise<Result<readonly AvailableSlot[]>> {
  const parsed = inputSchema.safeParse({
    serviceId: input.serviceId,
    date: input.date,
  });
  if (!parsed.success) {
    return validationError("Enter a valid service and date.");
  }

  const now = input.now ?? new Date();
  const settings = await getDataAccess().businessSettings.get();
  if (!settings.bookingEnabled) {
    return domainError(
      "BOOKING_DISABLED",
      "Booking is not available right now.",
    );
  }

  const service = await loadActiveService(parsed.data.serviceId);
  if (!service.ok) {
    return service;
  }

  const dayStart = parseLocalDate(parsed.data.date, settings.timezone);
  if (dayStart === null) {
    return domainError("INVALID_TIME", "That date is not valid.");
  }

  const hours = settings.weeklyHours[weekdayKey(dayStart, settings.timezone)];
  if (hours === undefined) {
    return ok([]);
  }

  const openHm = parseHm(hours.open);
  const closeHm = parseHm(hours.close);
  if (openHm === null || closeHm === null) {
    return domainError("INVALID_TIME", "Business hours are not valid.");
  }

  const open = zonedDateTime(
    {
      year: dayStart.year,
      month: dayStart.month,
      day: dayStart.day,
      hour: openHm.hour,
      minute: openHm.minute,
    },
    settings.timezone,
  );
  const close = zonedDateTime(
    {
      year: dayStart.year,
      month: dayStart.month,
      day: dayStart.day,
      hour: closeHm.hour,
      minute: closeHm.minute,
    },
    settings.timezone,
  );
  if (open === null || close === null) {
    return domainError("INVALID_TIME", "That date is not valid.");
  }

  const dayStartIso = toUtcIso(open);
  const dayEndIso = toUtcIso(close);
  const confirmed = await getDataAccess().appointments.listConfirmedOverlapping(
    dayStartIso,
    dayEndIso,
  );
  const blocked = await getDataAccess().blockedTimes.listOverlapping(
    dayStartIso,
    dayEndIso,
  );

  const slots: AvailableSlot[] = [];
  let cursor = open;
  while (cursor < close) {
    const startsAtIso = toUtcIso(cursor);
    const endsAtIso = endsAtFromDuration(
      startsAtIso,
      service.data.durationMinutes,
    );
    cursor = cursor.plus({ minutes: settings.slotIntervalMinutes });

    if (endsAtIso > dayEndIso) {
      continue;
    }
    if (startsAtIso < now.toISOString()) {
      continue;
    }

    const taken = confirmed.some((appointment) =>
      rangesOverlap(
        startsAtIso,
        endsAtIso,
        appointment.startsAt,
        appointment.endsAt,
      ),
    );
    const blockedOut = blocked.some((block) =>
      rangesOverlap(startsAtIso, endsAtIso, block.startsAt, block.endsAt),
    );
    if (!taken && !blockedOut) {
      slots.push({ startsAt: startsAtIso, endsAt: endsAtIso });
    }
  }

  return ok(slots);
}
