import "server-only";

import { getDataAccess } from "@/da";
import { requireAdmin } from "@/server/auth/require-admin";
import { domainError, unauthorizedError } from "@/lib/errors";
import type { CustomerId } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

export type CustomerActor = {
  kind: "customer";
  verificationToken: string;
};

export type AdminActor = {
  kind: "admin";
};

export type Actor = CustomerActor | AdminActor;

export type ResolvedActor =
  | { role: "customer"; customerId: CustomerId }
  | { role: "admin"; userId: string };

export async function resolveActor(
  actor: Actor,
  now: Date,
): Promise<Result<ResolvedActor>> {
  if (actor.kind === "admin") {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return domainError("NOT_AUTHORIZED", "You must be signed in as admin.");
    }
    return ok({ role: "admin", userId: admin.data.userId });
  }

  const session = await getDataAccess().bookingSessions.getByToken(
    actor.verificationToken,
  );
  if (session === null || session.expiresAt <= now.toISOString()) {
    return unauthorizedError("Verify your phone number to continue.");
  }

  return ok({ role: "customer", customerId: session.customerId });
}

export function canAccessCustomer(
  actor: ResolvedActor,
  customerId: CustomerId,
): boolean {
  if (actor.role === "admin") {
    return true;
  }
  return actor.customerId === customerId;
}
