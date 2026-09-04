import "server-only";

import { z } from "zod";

import { getDataAccess } from "@/da";
import { domainError, validationError } from "@/lib/errors";
import {
  canAccessCustomer,
  resolveActor,
  type Actor,
} from "@/server/appointments/actor";
import type { Appointment, AppointmentId } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

const idSchema = z.string().uuid();

export type GetAppointmentInput = {
  actor: Actor;
  appointmentId: AppointmentId;
  now?: Date;
};

export async function getAppointment(
  input: GetAppointmentInput,
): Promise<Result<Appointment>> {
  if (!idSchema.safeParse(input.appointmentId).success) {
    return validationError("Enter a valid appointment.");
  }

  const now = input.now ?? new Date();
  const actor = await resolveActor(input.actor, now);
  if (!actor.ok) {
    return actor;
  }

  const appointment = await getDataAccess().appointments.getById(
    input.appointmentId,
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

  return ok(appointment);
}
