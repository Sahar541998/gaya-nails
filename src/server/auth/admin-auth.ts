import "server-only";

import { requireAdmin } from "@/server/auth/require-admin";
import { isAdminPasswordAuthConfigured } from "@/server/auth/admin-credentials";
import type { Result } from "@/types/result";

export function isAdminAuthConfigured(): boolean {
  return isAdminPasswordAuthConfigured();
}

export async function getAdminSession(): Promise<
  Result<{ userId: string; username: string }>
> {
  return requireAdmin();
}
