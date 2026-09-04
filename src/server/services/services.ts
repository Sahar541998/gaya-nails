import "server-only";

import { getDataAccess } from "@/da";
import { ok, type Result } from "@/types/result";
import type { Service } from "@/types/domain";

export async function listServices(): Promise<Result<readonly Service[]>> {
  const services = await getDataAccess().services.listActive();
  return ok(services);
}
