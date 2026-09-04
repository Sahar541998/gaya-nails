import "server-only";

import { DaConflictError, getDataAccess } from "@/da";
import { domainError, validationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { parseBookingContact } from "@/server/booking/parse-booking-contact";
import { createAppointment } from "@/server/appointments/create-appointment";
import { requireAdmin } from "@/server/auth/require-admin";
import type { Appointment, ServiceId } from "@/types/domain";
import type { Result } from "@/types/result";

export async function createAdminAppointment(input: {
  serviceId: ServiceId;
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

  const contact = parseBookingContact({
    displayName: input.displayName,
    email: input.email,
    phone: input.phone,
    note: input.note,
  });
  if (!contact.ok) {
    return contact;
  }

  try {
    const customer = await getDataAccess().customers.getOrCreateByPhone(
      contact.data.phoneE164,
    );
    await getDataAccess().customers.updateContact(customer.id, {
      displayName: contact.data.displayName,
      email: contact.data.email,
    });

    return createAppointment({
      actor: { kind: "admin" },
      serviceId: input.serviceId,
      startsAt: input.startsAt,
      customerId: customer.id,
      note: contact.data.note,
      ...(input.now === undefined ? {} : { now: input.now }),
    });
  } catch (error) {
    if (error instanceof DaConflictError) {
      return validationError("That phone number is already in use.");
    }
    logger.error("Failed to create admin appointment", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return domainError("unavailable", "We could not create that appointment.");
  }
}
