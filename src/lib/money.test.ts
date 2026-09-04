import { describe, expect, it } from "vitest";

import {
  formatDurationMinutes,
  formatIlsFromCents,
  parseShekelsToCents,
  shekelsInputFromCents,
} from "@/lib/money";

describe("money", () => {
  it("formats shekels from cents", () => {
    expect(formatIlsFromCents(12000)).toBe("₪120");
    expect(formatIlsFromCents(15050)).toBe("₪150.50");
  });

  it("parses whole shekels to cents", () => {
    expect(parseShekelsToCents("120")).toBe(12000);
    expect(parseShekelsToCents("150.50")).toBe(15050);
    expect(parseShekelsToCents("0")).toBe(null);
    expect(parseShekelsToCents("abc")).toBe(null);
  });

  it("round-trips whole shekels", () => {
    expect(shekelsInputFromCents(12000)).toBe("120");
  });

  it("formats duration", () => {
    expect(formatDurationMinutes(90)).toBe("90 min");
    expect(formatDurationMinutes(90, "he")).toBe("90 דק׳");
  });
});
