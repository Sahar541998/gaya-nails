import "server-only";

import { notImplemented } from "@/lib/errors";
import type { Result } from "@/types/result";

export async function rescheduleAppointment(): Promise<Result<never>> {
  return notImplemented("rescheduleAppointment");
}
