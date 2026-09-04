import { describe, expect, it } from "vitest";

import { parseBookingContact } from "@/server/booking/parse-booking-contact";

describe("parseBookingContact", () => {
  it("accepts a valid booking contact", () => {
    const parsed = parseBookingContact({
      displayName: "Maya Cohen",
      email: "maya@example.com",
      phone: "0501234567",
      note: "Almond shape",
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }
    expect(parsed.data.phoneE164).toBe("+972501234567");
    expect(parsed.data.note).toBe("Almond shape");
  });

  it("requires a name", () => {
    const parsed = parseBookingContact({
      displayName: "A",
      email: "maya@example.com",
      phone: "+972501234567",
      note: "",
    });
    expect(parsed.ok).toBe(false);
  });

  it("rejects an invalid email", () => {
    const parsed = parseBookingContact({
      displayName: "Maya Cohen",
      email: "not-an-email",
      phone: "+972501234567",
      note: "",
    });
    expect(parsed.ok).toBe(false);
  });

  it("rejects an invalid phone", () => {
    const parsed = parseBookingContact({
      displayName: "Maya Cohen",
      email: "maya@example.com",
      phone: "12",
      note: "",
    });
    expect(parsed.ok).toBe(false);
  });
});
