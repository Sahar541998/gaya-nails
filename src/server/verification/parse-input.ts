import "server-only";

import { ok } from "@/types/result";
import { parsePhoneE164, verificationCodeSchema } from "@/lib/phone";
import { validationError } from "@/lib/errors";

export function parseVerificationInput(phone: string, code: string) {
  const parsedPhone = parsePhoneE164(phone);
  const parsedCode = verificationCodeSchema.safeParse(code.trim());

  if (!parsedPhone.success || !parsedCode.success) {
    return validationError("Enter a valid phone number and code.");
  }

  return ok({ phoneE164: parsedPhone.data, code: parsedCode.data });
}
