import "server-only";

import { DateTime } from "luxon";

import { err, ok, type Result } from "@/types/result";
import { getDataAccess } from "@/da";
import { logger } from "@/lib/logger";
import { consumeRateLimit } from "@/lib/rate-limit";
import { parseVerificationInput } from "@/server/verification/parse-input";

const CHECK_LIMIT = 8;
const CHECK_WINDOW_MS = 10 * 60 * 1000;
const SESSION_HOURS = 24;

export async function verifyPhone(
  phone: string,
  code: string,
): Promise<Result<{ verificationToken: string; expiresAt: string }>> {
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

    const customer =
      await getDataAccess().customers.getOrCreateByPhone(phoneE164);
    const expiresAt = DateTime.utc().plus({ hours: SESSION_HOURS }).toISO();
    if (expiresAt === null) {
      throw new Error("Invalid session expiry.");
    }
    const session = await getDataAccess().bookingSessions.create(
      customer.id,
      expiresAt,
    );

    return ok({
      verificationToken: session.token,
      expiresAt: session.expiresAt,
    });
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
