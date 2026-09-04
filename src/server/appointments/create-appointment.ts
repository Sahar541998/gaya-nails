import "server-only";

import { notImplemented } from "@/lib/errors";
import type { Result } from "@/types/result";

export async function createAppointment(): Promise<Result<never>> {
  return notImplemented("createAppointment");
}
