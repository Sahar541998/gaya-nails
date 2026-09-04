import "server-only";

import { unauthorizedError } from "@/lib/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Result } from "@/types/result";

export async function requireAdmin(): Promise<
  Result<{ userId: string; email: string | undefined }>
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorizedError("You must be signed in.");
  }

  return {
    ok: true,
    data: {
      userId: user.id,
      email: user.email,
    },
  };
}
