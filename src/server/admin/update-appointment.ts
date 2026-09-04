import "server-only";

import { z } from "zod";

import { DaConflictError, DaNotFoundError, getDataAccess } from "@/da";
import { domainError, validationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  assertBookableWindow,
  endsAtFromDuration,
  isConfirmed,
  loadActiveService,
  loadService,
  parseAppointmentStart,
} from "@/server/appointments/schedule";
import { parseBookingContact } from "@/server/booking/parse-booking-contact";
import { requireAdmin } from "@/server/auth/require-admin";
import type { Appointment, AppointmentId } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

const inputSchema = z.object({
  appointmentId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().min(1),
});

export async function updateAdminAppointment(input: {
  appointmentId: AppointmentId;
  serviceId: string;
  startsAt: string;
  displayName: string;
  email: string;
  phone: string;
  note: string;
  now?: Date;
}): Promise<Result<Appointment>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  const parsed = inputSchema.safeParse({
    appointmentId: input.appointmentId,
    serviceId: input.serviceId,
    startsAt: input.startsAt,
  });
  if (!parsed.success) {
    return validationError("Enter a valid appointment, service, and time.");
  }

  const contact = parseBookingContact({
    displayName: input.displayName,
    email: input.email,
    phone: input.phone,
    note: input.note,
  });
  if (!contact.ok) {
    return contact;
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
  if (!isConfirmed(appointment)) {
    return domainError(
      "APPOINTMENT_NOT_ACTIVE",
      "That appointment cannot be edited.",
    );
  }

  const serviceChanged = appointment.serviceId !== parsed.data.serviceId;
  const service = serviceChanged
    ? await loadActiveService(parsed.data.serviceId)
    : await loadService(parsed.data.serviceId);
  if (!service.ok) {
    return service;
  }

  const now = input.now ?? new Date();
  const settings = await getDataAccess().businessSettings.get();
  const startsAt = parseAppointmentStart(
    parsed.data.startsAt,
    settings.timezone,
  );
  if (!startsAt.ok) {
    return startsAt;
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
    requireBookingEnabled: false,
  });
  if (!window.ok) {
    return window;
  }

  try {
    const customer = await getDataAccess().customers.getById(
      appointment.customerId,
    );
    if (customer === null) {
      return domainError(
        "APPOINTMENT_NOT_FOUND",
        "That appointment was not found.",
      );
    }

    if (customer.phoneE164 !== contact.data.phoneE164) {
      await getDataAccess().customers.updatePhone(
        customer.id,
        contact.data.phoneE164,
      );
    }
    await getDataAccess().customers.updateContact(customer.id, {
      displayName: contact.data.displayName,
      email: contact.data.email,
    });

    const updated = await getDataAccess().appointments.updateDetails(
      appointment.id,
      {
        customerId: customer.id,
        serviceId: service.data.id,
        startsAt: window.data.startsAtIso,
        endsAt: window.data.endsAtIso,
        serviceNameAtBooking: service.data.name,
        priceCentsAtBooking: service.data.priceCents,
        note: contact.data.note,
      },
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
    logger.error("Failed to update appointment", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return domainError("unavailable", "We could not update that appointment.");
  }
}
