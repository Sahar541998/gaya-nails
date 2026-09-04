import "server-only";

import { notImplemented } from "@/lib/errors";
import type { Result } from "@/types/result";

export async function createAppointment(): Promise<Result<never>> {
  return notImplemented("createAppointment");
}

export async function cancelAppointment(): Promise<Result<never>> {
  return notImplemented("cancelAppointment");
}

export async function rescheduleAppointment(): Promise<Result<never>> {
  return notImplemented("rescheduleAppointment");
}

export async function getAppointments(): Promise<Result<never>> {
  return notImplemented("getAppointments");
}
