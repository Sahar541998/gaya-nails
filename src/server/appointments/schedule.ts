import "server-only";

import { DateTime } from "luxon";

import { getDataAccess } from "@/da";
import {
  addMinutes,
  dayHoursFor,
  localDateParts,
  parseHm,
  parseInstant,
  rangesOverlap,
  toUtcIso,
  zonedDateTime,
} from "@/lib/business-time";
import { domainError } from "@/lib/errors";
import type {
  Appointment,
  AppointmentId,
  BusinessSettings,
  Service,
} from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

export function parseAppointmentStart(
  startsAt: string,
  timeZone: string,
): Result<string> {
  const parsed = parseInstant(startsAt, timeZone);
  if (parsed === null) {
    return domainError("INVALID_TIME", "That appointment time is not valid.");
  }
  return ok(toUtcIso(parsed));
}

export function endsAtFromDuration(
  startsAtIso: string,
  durationMinutes: number,
): string {
  return addMinutes(startsAtIso, durationMinutes);
}

export async function loadActiveService(
  serviceId: string,
): Promise<Result<Service>> {
  const service = await getDataAccess().services.getById(serviceId);
  if (service === null) {
    return domainError("SERVICE_NOT_FOUND", "That service is not available.");
  }
  if (!service.isActive) {
    return domainError("SERVICE_INACTIVE", "That service is not available.");
  }
  return ok(service);
}

export async function assertBookableWindow(input: {
  startsAtIso: string;
  endsAtIso: string;
  settings: BusinessSettings;
  now: Date;
  ignoreAppointmentId?: AppointmentId;
}): Promise<Result<{ startsAtIso: string; endsAtIso: string }>> {
  const { startsAtIso, endsAtIso, settings, now } = input;

  if (!settings.bookingEnabled) {
    return domainError(
      "BOOKING_DISABLED",
      "Booking is not available right now.",
    );
  }

  if (startsAtIso >= endsAtIso) {
    return domainError("INVALID_TIME", "That appointment time is not valid.");
  }

  if (startsAtIso < now.toISOString()) {
    return domainError("INVALID_TIME", "That appointment time is in the past.");
  }

  const start = DateTime.fromISO(startsAtIso, { setZone: true });
  const end = DateTime.fromISO(endsAtIso, { setZone: true });
  if (!start.isValid || !end.isValid) {
    return domainError("INVALID_TIME", "That appointment time is not valid.");
  }

  const hours = dayHoursFor(start, settings.timezone, settings.weeklyHours);
  if (hours === undefined) {
    return domainError(
      "OUTSIDE_BUSINESS_HOURS",
      "That time is outside business hours.",
    );
  }

  const openHm = parseHm(hours.open);
  const closeHm = parseHm(hours.close);
  const startParts = localDateParts(start, settings.timezone);
  const endParts = localDateParts(end, settings.timezone);
  if (
    openHm === null ||
    closeHm === null ||
    startParts.year !== endParts.year ||
    startParts.month !== endParts.month ||
    startParts.day !== endParts.day
  ) {
    return domainError(
      "OUTSIDE_BUSINESS_HOURS",
      "That time is outside business hours.",
    );
  }

  const open = zonedDateTime({ ...startParts, ...openHm }, settings.timezone);
  const close = zonedDateTime({ ...startParts, ...closeHm }, settings.timezone);
  if (open === null || close === null) {
    return domainError("INVALID_TIME", "That appointment time is not valid.");
  }

  const openIso = toUtcIso(open);
  const closeIso = toUtcIso(close);
  if (startsAtIso < openIso || endsAtIso > closeIso) {
    return domainError(
      "OUTSIDE_BUSINESS_HOURS",
      "That time is outside business hours.",
    );
  }

  const blocked = await getDataAccess().blockedTimes.listOverlapping(
    startsAtIso,
    endsAtIso,
  );
  if (blocked.length > 0) {
    return domainError("TIME_BLOCKED", "That time is blocked.");
  }

  const overlapping =
    await getDataAccess().appointments.listConfirmedOverlapping(
      startsAtIso,
      endsAtIso,
    );
  const conflict = overlapping.some((appointment) => {
    if (
      input.ignoreAppointmentId !== undefined &&
      appointment.id === input.ignoreAppointmentId
    ) {
      return false;
    }
    return rangesOverlap(
      startsAtIso,
      endsAtIso,
      appointment.startsAt,
      appointment.endsAt,
    );
  });
  if (conflict) {
    return domainError("SLOT_UNAVAILABLE", "That time is no longer available.");
  }

  return ok({ startsAtIso, endsAtIso });
}

export function isConfirmed(appointment: Appointment): boolean {
  return appointment.status === "confirmed";
}
