import "server-only";

import type { SmsVerifier } from "@/da/sms/sms-verifier";
import { getSmsMockUrl } from "@/lib/env";

async function postJson(path: string, body: Record<string, string>) {
  const response = await fetch(new URL(path, getSmsMockUrl()), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("SMS mock request failed.");
  }

  const payload: unknown = await response.json();
  if (typeof payload !== "object" || payload === null) {
    return { approved: false };
  }

  const approved = "approved" in payload && payload.approved === true;
  return { approved };
}

export function createDockerSmsVerifier(): SmsVerifier {
  return {
    async send(phoneE164) {
      await postJson("/verifications", { to: phoneE164 });
    },
    async check(phoneE164, code) {
      const result = await postJson("/checks", { to: phoneE164, code });
      return result.approved;
    },
  };
}
