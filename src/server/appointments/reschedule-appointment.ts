import "server-only";

import { z } from "zod";

import { DaConflictError, DaNotFoundError, getDataAccess } from "@/da";
import { domainError, validationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  canAccessCustomer,
  resolveActor,
  type Actor,
} from "@/server/appointments/actor";
import {
  assertBookableWindow,
  endsAtFromDuration,
  isConfirmed,
  loadService,
  parseAppointmentStart,
} from "@/server/appointments/schedule";
import type { Appointment, AppointmentId } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

const inputSchema = z.object({
  appointmentId: z.string().uuid(),
  startsAt: z.string().min(1),
});

export type RescheduleAppointmentInput = {
  actor: Actor;
  appointmentId: AppointmentId;
  startsAt: string;
  now?: Date;
};

export async function rescheduleAppointment(
  input: RescheduleAppointmentInput,
): Promise<Result<Appointment>> {
  const parsed = inputSchema.safeParse({
    appointmentId: input.appointmentId,
    startsAt: input.startsAt,
  });
  if (!parsed.success) {
    return validationError("Enter a valid appointment and start time.");
  }

  const now = input.now ?? new Date();
  const actor = await resolveActor(input.actor, now);
  if (!actor.ok) {
    return actor;
  }

  const appointment = await getDataAccess().appointments.getById(
    parsed.data.appointmentId,
  );
  if (appointment === null) {
    return domainError(
      "APPOINTMENT_NOT_FOUND",
      "That appointment was not found.",
    );
  }

  if (!canAccessCustomer(actor.data, appointment.customerId)) {
    return domainError("NOT_AUTHORIZED", "You are not allowed to do that.");
  }

  if (appointment.status === "cancelled") {
    return domainError(
      "APPOINTMENT_ALREADY_CANCELLED",
      "That appointment is already cancelled.",
    );
  }

  if (!isConfirmed(appointment)) {
    return domainError(
      "APPOINTMENT_NOT_ACTIVE",
      "That appointment cannot be rescheduled.",
    );
  }

  const settings = await getDataAccess().businessSettings.get();
  const startsAt = parseAppointmentStart(
    parsed.data.startsAt,
    settings.timezone,
  );
  if (!startsAt.ok) {
    return startsAt;
  }

  const service = await loadService(appointment.serviceId);
  if (!service.ok) {
    return service;
  }

  const endsAtIso = endsAtFromDuration(
    startsAt.data,
    service.data.durationMinutes,
  );
  const window = await assertBookableWindow({
    startsAtIso: startsAt.data,
    endsAtIso,
    settings,
    now,
    ignoreAppointmentId: appointment.id,
    requireBookingEnabled: actor.data.role !== "admin",
  });
  if (!window.ok) {
    return window;
  }

  try {
    const updated = await getDataAccess().appointments.updateSchedule(
      appointment.id,
      window.data.startsAtIso,
      window.data.endsAtIso,
    );
    return ok(updated);
  } catch (error) {
    if (error instanceof DaNotFoundError) {
      return domainError(
        "APPOINTMENT_NOT_FOUND",
        "That appointment was not found.",
      );
    }
    if (error instanceof DaConflictError) {
      return domainError(
        "SLOT_UNAVAILABLE",
        "That time is no longer available.",
      );
    }
    logger.error("Failed to reschedule appointment", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return domainError(
      "unavailable",
      "We could not reschedule that appointment.",
    );
  }
}
