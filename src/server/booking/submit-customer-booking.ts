import "server-only";

import { getDataAccess } from "@/da";
import { validationError } from "@/lib/errors";
import { createAppointment } from "@/server/appointments/create-appointment";
import type { CustomerActor } from "@/server/appointments/actor";
import { parseBookingContact } from "@/server/booking/parse-booking-contact";
import type { ServiceId } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

export type SubmitCustomerBookingInput = {
  actor: CustomerActor;
  serviceId: ServiceId;
  startsAt: string;
  displayName: string;
  email: string;
  phone: string;
  note: string;
  now?: Date;
};

export type PublicBookingConfirmation = {
  serviceName: string;
  priceCents: number;
  durationMinutes: number;
  startsAt: string;
  endsAt: string;
  displayName: string;
  email: string;
  phoneE164: string;
  note: string;
};

export async function submitCustomerBooking(
  input: SubmitCustomerBookingInput,
): Promise<Result<PublicBookingConfirmation>> {
  const contact = parseBookingContact({
    displayName: input.displayName,
    email: input.email,
    phone: input.phone,
    note: input.note,
  });
  if (!contact.ok) {
    return contact;
  }

  const now = input.now ?? new Date();
  const session = await getDataAccess().bookingSessions.getByToken(
    input.actor.verificationToken,
  );
  if (session === null || session.expiresAt <= now.toISOString()) {
    return validationError("Verify your phone number to continue.");
  }

  const customer = await getDataAccess().customers.getById(session.customerId);
  if (customer === null || customer.phoneE164 !== contact.data.phoneE164) {
    return validationError("Verify the phone number you entered.");
  }

  await getDataAccess().customers.updateContact(customer.id, {
    displayName: contact.data.displayName,
    email: contact.data.email,
  });

  const created = await createAppointment({
    actor: input.actor,
    serviceId: input.serviceId,
    startsAt: input.startsAt,
    note: contact.data.note,
    now,
  });
  if (!created.ok) {
    return created;
  }

  const bookedService = await getDataAccess().services.getById(input.serviceId);

  return ok({
    serviceName: created.data.serviceNameAtBooking,
    priceCents: created.data.priceCentsAtBooking,
    durationMinutes: bookedService?.durationMinutes ?? 0,
    startsAt: created.data.startsAt,
    endsAt: created.data.endsAt,
    displayName: contact.data.displayName,
    email: contact.data.email,
    phoneE164: contact.data.phoneE164,
    note: created.data.note,
  });
}
