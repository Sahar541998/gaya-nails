import "server-only";

import { err, ok, type Result } from "@/types/result";
import { logger } from "@/lib/logger";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getDataAccess } from "@/da";
import { parseVerificationInput } from "@/server/verification/parse-input";

const CHECK_LIMIT = 8;
const CHECK_WINDOW_MS = 10 * 60 * 1000;

export async function verifyPhone(
  phone: string,
  code: string,
): Promise<Result<{ verified: true }>> {
  const parsed = parseVerificationInput(phone, code);
  if (!parsed.ok) {
    return parsed;
  }

  const { phoneE164, code: verificationCode } = parsed.data;

  if (
    !consumeRateLimit(`verify-check:${phoneE164}`, CHECK_LIMIT, CHECK_WINDOW_MS)
  ) {
    return err({
      code: "rate_limited",
      message: "Too many attempts. Try again later.",
    });
  }

  try {
    const approved = await getDataAccess().sms.check(
      phoneE164,
      verificationCode,
    );
    if (!approved) {
      return err({
        code: "validation",
        message: "That code is not valid.",
      });
    }

    return ok({ verified: true });
  } catch (error) {
    logger.error("Failed to check phone verification", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return err({
      code: "unavailable",
      message: "We could not verify that code. Try again shortly.",
    });
  }
}
