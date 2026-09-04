import "server-only";

import twilio from "twilio";

import type { SmsVerifier } from "@/da/contracts";
import { getTwilioEnv } from "@/lib/env";

let client: ReturnType<typeof twilio> | undefined;

function getTwilioClient() {
  const env = getTwilioEnv();
  client ??= twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  return client;
}

export function createTwilioSmsVerifier(): SmsVerifier {
  return {
    async send(phoneE164) {
      const env = getTwilioEnv();
      await getTwilioClient()
        .verify.v2.services(env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: phoneE164,
          channel: "sms",
        });
    },
    async check(phoneE164, code) {
      const env = getTwilioEnv();
      const result = await getTwilioClient()
        .verify.v2.services(env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({
          to: phoneE164,
          code,
        });

      return result.status === "approved";
    },
  };
}
