import "server-only";

import { notImplemented } from "@/lib/errors";
import type { Result } from "@/types/result";

export async function getAppointments(): Promise<Result<never>> {
  return notImplemented("getAppointments");
}
