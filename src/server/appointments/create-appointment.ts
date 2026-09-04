import "server-only";

import { z } from "zod";

import { DaConflictError, getDataAccess } from "@/da";
import { domainError, validationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { resolveActor, type Actor } from "@/server/appointments/actor";
import {
  assertBookableWindow,
  endsAtFromDuration,
  loadActiveService,
  parseAppointmentStart,
} from "@/server/appointments/schedule";
import type { Appointment, CustomerId, ServiceId } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

const inputSchema = z.object({
  serviceId: z.string().uuid(),
  startsAt: z.string().min(1),
  customerId: z.string().uuid().optional(),
  note: z.string().max(500).optional(),
});

export type CreateAppointmentInput = {
  actor: Actor;
  serviceId: ServiceId;
  startsAt: string;
  customerId?: CustomerId;
  note?: string;
  now?: Date;
};

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<Result<Appointment>> {
  const parsed = inputSchema.safeParse({
    serviceId: input.serviceId,
    startsAt: input.startsAt,
    customerId: input.customerId,
    note: input.note,
  });
  if (!parsed.success) {
    return validationError("Enter a valid service and start time.");
  }

  const now = input.now ?? new Date();
  const actor = await resolveActor(input.actor, now);
  if (!actor.ok) {
    return actor;
  }

  let customerId: CustomerId;
  if (actor.data.role === "customer") {
    if (parsed.data.customerId !== undefined) {
      return domainError(
        "NOT_AUTHORIZED",
        "You cannot book on behalf of another customer.",
      );
    }
    customerId = actor.data.customerId;
  } else if (parsed.data.customerId === undefined) {
    return validationError("Choose a customer for this appointment.");
  } else {
    const customer = await getDataAccess().customers.getById(
      parsed.data.customerId,
    );
    if (customer === null) {
      return validationError("That customer was not found.");
    }
    customerId = customer.id;
  }

  const settings = await getDataAccess().businessSettings.get();
  const startsAt = parseAppointmentStart(
    parsed.data.startsAt,
    settings.timezone,
  );
  if (!startsAt.ok) {
    return startsAt;
  }

  const service = await loadActiveService(parsed.data.serviceId);
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
  });
  if (!window.ok) {
    return window;
  }

  try {
    const appointment = await getDataAccess().appointments.create({
      customerId,
      serviceId: service.data.id,
      startsAt: window.data.startsAtIso,
      endsAt: window.data.endsAtIso,
      serviceNameAtBooking: service.data.name,
      priceCentsAtBooking: service.data.priceCents,
      note: parsed.data.note ?? "",
    });
    return ok(appointment);
  } catch (error) {
    if (error instanceof DaConflictError) {
      return domainError(
        "SLOT_UNAVAILABLE",
        "That time is no longer available.",
      );
    }
    logger.error("Failed to create appointment", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return domainError("unavailable", "We could not complete that booking.");
  }
}
