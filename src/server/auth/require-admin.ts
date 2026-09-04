import "server-only";

import { unauthorizedError } from "@/lib/errors";
import { readAdminJwtSession } from "@/server/auth/admin-session";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

function testBypassEnabled(): boolean {
  return (
    process.env.ADMIN_TEST_BYPASS === "1" &&
    process.env.NODE_ENV !== "production"
  );
}

export async function requireAdmin(): Promise<
  Result<{ userId: string; username: string }>
> {
  if (testBypassEnabled()) {
    return ok({ userId: "test-admin", username: "admin" });
  }

  const session = await readAdminJwtSession();
  if (session === null) {
    return unauthorizedError("You must be signed in.");
  }

  return ok({
    userId: session.sub,
    username: session.username,
  });
}
