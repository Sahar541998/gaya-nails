import "server-only";

import { err, ok, type Result } from "@/types/result";
import { logger } from "@/lib/logger";
import { parsePhoneE164 } from "@/lib/phone";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getDataAccess } from "@/da";
import { validationError } from "@/lib/errors";

const SEND_LIMIT = 3;
const SEND_WINDOW_MS = 10 * 60 * 1000;

export async function sendPhoneVerification(
  phone: string,
): Promise<Result<{ sent: true }>> {
  const parsedPhone = parsePhoneE164(phone);
  if (!parsedPhone.success) {
    return validationError("Enter a valid phone number.");
  }

  const phoneE164 = parsedPhone.data;
  if (
    !consumeRateLimit(`verify-send:${phoneE164}`, SEND_LIMIT, SEND_WINDOW_MS)
  ) {
    return err({
      code: "rate_limited",
      message: "Please wait before requesting another code.",
    });
  }

  try {
    await getDataAccess().sms.send(phoneE164);
    return ok({ sent: true });
  } catch (error) {
    logger.error("Failed to send phone verification", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return err({
      code: "unavailable",
      message: "We could not send a verification code. Try again shortly.",
    });
  }
}
