import "server-only";

import { z } from "zod";

import { DaNotFoundError, getDataAccess } from "@/da";
import { domainError, validationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { parseAppointmentStart } from "@/server/appointments/schedule";
import { requireAdmin } from "@/server/auth/require-admin";
import type { BlockedTime, BlockedTimeId } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

const rangeSchema = z.object({
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  note: z.string().trim().max(500).optional(),
});

async function parseRange(input: {
  startsAt: string;
  endsAt: string;
  note?: string;
}): Promise<Result<{ startsAt: string; endsAt: string; note: string }>> {
  const parsed = rangeSchema.safeParse(input);
  if (!parsed.success) {
    return validationError("Enter a valid start and end time.");
  }

  const settings = await getDataAccess().businessSettings.get();
  const startsAt = parseAppointmentStart(
    parsed.data.startsAt,
    settings.timezone,
  );
  const endsAt = parseAppointmentStart(parsed.data.endsAt, settings.timezone);
  if (!startsAt.ok) {
    return validationError("Enter a valid start time.");
  }
  if (!endsAt.ok) {
    return validationError("Enter a valid end time.");
  }
  if (endsAt.data <= startsAt.data) {
    return validationError("End time must be after start time.");
  }

  return ok({
    startsAt: startsAt.data,
    endsAt: endsAt.data,
    note: parsed.data.note ?? "",
  });
}

export async function createBusyBlock(input: {
  startsAt: string;
  endsAt: string;
  note?: string;
}): Promise<Result<BlockedTime>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  const range = await parseRange(input);
  if (!range.ok) {
    return range;
  }

  const block = await getDataAccess().blockedTimes.create(range.data);
  return ok(block);
}

export async function updateBusyBlock(input: {
  id: BlockedTimeId;
  startsAt: string;
  endsAt: string;
  note?: string;
}): Promise<Result<BlockedTime>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  if (!z.string().uuid().safeParse(input.id).success) {
    return validationError("That blocked time was not found.");
  }

  const range = await parseRange(input);
  if (!range.ok) {
    return range;
  }

  try {
    const block = await getDataAccess().blockedTimes.update(
      input.id,
      range.data,
    );
    return ok(block);
  } catch (error) {
    if (error instanceof DaNotFoundError) {
      return validationError("That blocked time was not found.");
    }
    logger.error("Failed to update blocked time", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return domainError("unavailable", "We could not update that blocked time.");
  }
}

export async function deleteBusyBlock(
  id: BlockedTimeId,
): Promise<Result<{ id: BlockedTimeId }>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  if (!z.string().uuid().safeParse(id).success) {
    return validationError("That blocked time was not found.");
  }

  try {
    await getDataAccess().blockedTimes.delete(id);
    return ok({ id });
  } catch (error) {
    if (error instanceof DaNotFoundError) {
      return validationError("That blocked time was not found.");
    }
    logger.error("Failed to delete blocked time", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return domainError("unavailable", "We could not delete that blocked time.");
  }
}

export async function listBusyBlocksInRange(input: {
  startsAt: string;
  endsAt: string;
}): Promise<Result<readonly BlockedTime[]>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  const blocks = await getDataAccess().blockedTimes.listOverlapping(
    input.startsAt,
    input.endsAt,
  );
  return ok(blocks);
}
