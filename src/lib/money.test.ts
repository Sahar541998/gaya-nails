import { describe, expect, it } from "vitest";

import { formatDurationMinutes, formatIlsFromCents } from "@/lib/money";

describe("money", () => {
  it("formats shekels from cents", () => {
    expect(formatIlsFromCents(12000)).toBe("₪120");
    expect(formatIlsFromCents(15050)).toBe("₪150.50");
  });

  it("formats duration", () => {
    expect(formatDurationMinutes(90)).toBe("90 min");
  });
});
