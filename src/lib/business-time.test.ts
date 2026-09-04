import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import {
  addMinutes,
  BUSINESS_TIME_ZONE,
  parseInstant,
  rangesOverlap,
  weekdayKey,
} from "@/lib/business-time";

describe("business time", () => {
  it("adds service duration as elapsed time", () => {
    const start = "2099-06-16T06:00:00.000Z";
    expect(addMinutes(start, 120)).toBe("2099-06-16T08:00:00.000Z");
  });

  it("treats back-to-back ranges as non-overlapping", () => {
    expect(
      rangesOverlap(
        "2099-06-16T06:00:00.000Z",
        "2099-06-16T08:00:00.000Z",
        "2099-06-16T08:00:00.000Z",
        "2099-06-16T10:00:00.000Z",
      ),
    ).toBe(false);
  });

  it("uses Asia/Jerusalem weekdays (Sunday is 0)", () => {
    const sunday = DateTime.fromObject(
      { year: 2099, month: 6, day: 14, hour: 10 },
      { zone: BUSINESS_TIME_ZONE },
    );
    expect(weekdayKey(sunday, BUSINESS_TIME_ZONE)).toBe("0");
  });

  it("keeps elapsed time correct across Israel DST", () => {
    const before = DateTime.fromObject(
      { year: 2026, month: 3, day: 27, hour: 1, minute: 30 },
      { zone: BUSINESS_TIME_ZONE },
    );
    const after = DateTime.fromObject(
      { year: 2026, month: 3, day: 27, hour: 3, minute: 30 },
      { zone: BUSINESS_TIME_ZONE },
    );
    expect(before.isValid).toBe(true);
    expect(after.isValid).toBe(true);
    expect(after.diff(before, "minutes").minutes).toBe(60);
  });

  it("parses offset-less local times in the business timezone", () => {
    const parsed = parseInstant("2099-06-16T09:00:00", BUSINESS_TIME_ZONE);
    expect(parsed?.toUTC().toISO()).toBe(
      DateTime.fromObject(
        { year: 2099, month: 6, day: 16, hour: 9, minute: 0 },
        { zone: BUSINESS_TIME_ZONE },
      )
        .toUTC()
        .toISO(),
    );
  });
});
