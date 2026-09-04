import "server-only";

import { z } from "zod";

import { DaConflictError, DaNotFoundError, getDataAccess } from "@/da";
import { domainError, validationError } from "@/lib/errors";
import { parseShekelsToCents } from "@/lib/money";
import { requireAdmin } from "@/server/auth/require-admin";
import type { Service, ServiceId } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

const serviceFieldsSchema = z.object({
  name: z.string().trim().min(1, "Enter a service name.").max(80),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  shortDescription: z.string().trim().max(280),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
});

function parseServiceInput(input: {
  name: string;
  durationMinutes: number;
  priceShekels: string;
  shortDescription: string;
  isActive: boolean;
  sortOrder: number;
}) {
  const priceCents = parseShekelsToCents(input.priceShekels);
  if (priceCents === null) {
    return validationError("Enter a valid price in shekels.");
  }

  const parsed = serviceFieldsSchema.safeParse({
    name: input.name,
    durationMinutes: input.durationMinutes,
    shortDescription: input.shortDescription,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return validationError(first ?? "Check the service details and try again.");
  }

  return ok({
    ...parsed.data,
    priceCents,
  });
}

export async function listAdminServices(): Promise<Result<readonly Service[]>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  const services = await getDataAccess().services.listAll();
  return ok(services);
}

export async function createService(input: {
  name: string;
  durationMinutes: number;
  priceShekels: string;
  shortDescription: string;
  isActive: boolean;
  sortOrder?: number;
}): Promise<Result<Service>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  const existing = await getDataAccess().services.listAll();
  const sortOrder =
    input.sortOrder ??
    existing.reduce((max, service) => Math.max(max, service.sortOrder), -1) + 1;

  const parsed = parseServiceInput({
    ...input,
    sortOrder,
  });
  if (!parsed.ok) {
    return parsed;
  }

  const service = await getDataAccess().services.create(parsed.data);
  return ok(service);
}

export async function updateService(input: {
  id: ServiceId;
  name: string;
  durationMinutes: number;
  priceShekels: string;
  shortDescription: string;
  isActive: boolean;
  sortOrder: number;
}): Promise<Result<Service>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  if (!z.string().uuid().safeParse(input.id).success) {
    return domainError("SERVICE_NOT_FOUND", "That service was not found.");
  }

  const parsed = parseServiceInput(input);
  if (!parsed.ok) {
    return parsed;
  }

  try {
    const service = await getDataAccess().services.update(
      input.id,
      parsed.data,
    );
    return ok(service);
  } catch (error) {
    if (error instanceof DaNotFoundError) {
      return domainError("SERVICE_NOT_FOUND", "That service was not found.");
    }
    throw error;
  }
}

export async function setServiceActive(input: {
  id: ServiceId;
  isActive: boolean;
}): Promise<Result<Service>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  const service = await getDataAccess().services.getById(input.id);
  if (service === null) {
    return domainError("SERVICE_NOT_FOUND", "That service was not found.");
  }

  const updated = await getDataAccess().services.update(service.id, {
    name: service.name,
    durationMinutes: service.durationMinutes,
    priceCents: service.priceCents,
    shortDescription: service.shortDescription,
    isActive: input.isActive,
    sortOrder: service.sortOrder,
  });
  return ok(updated);
}

export async function deleteService(
  id: ServiceId,
): Promise<Result<{ id: ServiceId }>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  if (!z.string().uuid().safeParse(id).success) {
    return domainError("SERVICE_NOT_FOUND", "That service was not found.");
  }

  const count = await getDataAccess().services.countAppointments(id);
  if (count > 0) {
    return domainError(
      "SERVICE_IN_USE",
      "This service has appointments, so it cannot be deleted. Deactivate it instead.",
    );
  }

  try {
    await getDataAccess().services.delete(id);
    return ok({ id });
  } catch (error) {
    if (error instanceof DaNotFoundError) {
      return domainError("SERVICE_NOT_FOUND", "That service was not found.");
    }
    if (error instanceof DaConflictError) {
      return domainError(
        "SERVICE_IN_USE",
        "This service has appointments, so it cannot be deleted. Deactivate it instead.",
      );
    }
    throw error;
  }
}
