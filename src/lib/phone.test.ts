import { describe, expect, it } from "vitest";

import { normalizePhoneInput, parsePhoneE164 } from "@/lib/phone";

describe("phone", () => {
  it("normalizes local Israeli numbers to E.164", () => {
    expect(normalizePhoneInput("0501234567")).toBe("+972501234567");
    expect(parsePhoneE164("050-123-4567").success).toBe(true);
  });

  it("keeps explicit E.164 numbers", () => {
    expect(parsePhoneE164("+14155550100").success).toBe(true);
  });

  it("rejects incomplete numbers", () => {
    expect(parsePhoneE164("123").success).toBe(false);
  });
});
