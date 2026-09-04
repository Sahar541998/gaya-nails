import "server-only";

import twilio from "twilio";

import { getTwilioEnv } from "@/lib/env";

let client: ReturnType<typeof twilio> | undefined;

function getTwilioClient() {
  const env = getTwilioEnv();
  client ??= twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  return client;
}

export async function sendVerificationSms(phoneE164: string): Promise<void> {
  const env = getTwilioEnv();
  await getTwilioClient()
    .verify.v2.services(env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: phoneE164,
      channel: "sms",
    });
}

export async function checkVerificationSms(
  phoneE164: string,
  code: string,
): Promise<boolean> {
  const env = getTwilioEnv();
  const check = await getTwilioClient()
    .verify.v2.services(env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phoneE164,
      code,
    });

  return check.status === "approved";
}
