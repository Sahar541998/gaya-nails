import "server-only";

import type { Service, ServiceId } from "@/types/domain";

export type CreateServiceRecord = {
  name: string;
  durationMinutes: number;
  priceCents: number;
  shortDescription: string;
  isActive: boolean;
  sortOrder: number;
};

export type UpdateServiceRecord = {
  name: string;
  durationMinutes: number;
  priceCents: number;
  shortDescription: string;
  isActive: boolean;
  sortOrder: number;
};

export type Services = {
  listActive(): Promise<readonly Service[]>;
  listAll(): Promise<readonly Service[]>;
  getById(id: ServiceId): Promise<Service | null>;
  create(input: CreateServiceRecord): Promise<Service>;
  update(id: ServiceId, input: UpdateServiceRecord): Promise<Service>;
  countAppointments(id: ServiceId): Promise<number>;
  delete(id: ServiceId): Promise<void>;
};
