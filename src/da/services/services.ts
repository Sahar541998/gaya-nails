import "server-only";

import type { Service, ServiceId } from "@/types/domain";

export type Services = {
  listActive(): Promise<readonly Service[]>;
  getById(id: ServiceId): Promise<Service | null>;
};
