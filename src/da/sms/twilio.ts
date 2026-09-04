import "server-only";

import type { SmsVerifier } from "@/da/sms/sms-verifier";
import { checkVerificationSms, sendVerificationSms } from "@/lib/twilio/verify";

export function createTwilioSmsVerifier(): SmsVerifier {
  return {
    send: sendVerificationSms,
    check: checkVerificationSms,
  };
}
